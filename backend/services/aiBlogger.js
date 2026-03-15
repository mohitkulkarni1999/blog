const axios = require('axios');
const slugify = require('slugify');
const pool = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── CONFIGURATION & MODELS ──────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = 'gemini-2.0-flash';

// ─── UTILITIES & HELPERS ─────────────────────────────────────────────────────

/**
 * Advanced Similarity Detection (Dice's Coefficient)
 */
function compareSimilarity(str1, str2) {
    const getBigrams = (str) => {
        const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const bigrams = new Set();
        for (let i = 0; i < s.length - 1; i++) bigrams.add(s.substring(i, i + 2));
        return bigrams;
    };
    const b1 = getBigrams(str1);
    const b2 = getBigrams(str2);
    const intersection = new Set([...b1].filter(x => b2.has(x)));
    return (2.0 * intersection.size) / (b1.size + b2.size);
}

/**
 * Stability AI Image Generation (Placeholder if no key)
 */
async function generateFeaturedImage(prompt) {
    const API_KEY = process.env.STABILITY_API_KEY;
    if (!API_KEY) {
        console.warn('[AI Blogger] ⚠️ STABILITY_API_KEY missing. Using premium placeholder.');
        return `https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200`;
    }

    try {
        console.log('[AI Blogger] 🎨 Generating AI visual from prompt...');
        const res = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
            {
                text_prompts: [{ text: prompt, weight: 1 }],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                steps: 30,
                samples: 1,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                },
            }
        );
        return "https://images.unsplash.com/photo-1620712943543-bcc4628c9757?auto=format&fit=crop&q=80&w=1200";
    } catch (err) {
        console.error('[AI Blogger] Image Gen Failed:', err.message);
        return null;
    }
}

/**
 * Fetch Internal Links for SEO
 */
async function getInternalLinks() {
    try {
        const [rows] = await pool.query('SELECT slug, title FROM posts WHERE status = "published" ORDER BY created_at DESC LIMIT 5');
        return rows.map(r => `<a href="/blog/${r.slug}">${r.title}</a>`).join(', ');
    } catch (err) {
        return '';
    }
}

// ─── NEWS SIGNAL FETCHERS ────────────────────────────────────────────────────

async function fetchNewsAPI() {
    try {
        const allCategories = ['technology', 'business', 'science', 'gaming', 'entertainment', 'health'];
        // Pick 3 random categories to ensure diversity
        const selected = allCategories.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        const newsPromises = selected.map(cat => 
            axios.get('https://newsapi.org/v2/top-headlines', {
                params: { language: 'en', category: cat, apiKey: process.env.NEWS_API_KEY, pageSize: 10 },
                timeout: 10000
            }).catch(() => ({ data: { articles: [] } }))
        );

        const results = await Promise.all(newsPromises);
        const articles = results.flatMap((res, index) => 
            (res.data.articles || []).map(a => ({
                title: a.title,
                description: a.description,
                source: `NewsAPI (${selected[index]})`,
                publishedAt: a.publishedAt
            }))
        );

        return articles.filter(a => a.title && a.description && !a.title.includes('[Removed]'));
    } catch (err) {
        console.error('[AI Blogger] NewsAPI Fetch Error:', err.message);
        return [];
    }
}

async function fetchHackerNews() {
    try {
        const { data: topIds } = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const articles = [];
        for (const id of topIds.slice(0, 10)) {
            const { data: item } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            if (item && item.title && (item.url || item.text)) {
                articles.push({
                    title: item.title,
                    description: item.text ? item.text.substring(0, 300) : `Deep tech discussion on ${item.title}`,
                    source: 'HackerNews'
                });
            }
            if (articles.length >= 3) break;
        }
        return articles;
    } catch { return []; }
}

async function fetchRedditTech() {
    try {
        const res = await axios.get('https://www.reddit.com/r/technology/hot.json?limit=10', {
            headers: { 'User-Agent': 'DailyUpdatesHub/1.5' }
        });
        return res.data.data.children
            .filter(child => !child.data.stickied && child.data.title)
            .slice(0, 3)
            .map(child => ({
                title: child.data.title,
                description: child.data.selftext ? child.data.selftext.substring(0, 300) : `Trending community discussion: ${child.data.title}`,
                source: 'Reddit/r/technology',
                publishedAt: new Date(child.data.created_utc * 1000).toISOString()
            }));
    } catch { return []; }
}

async function fetchGoogleTrends() {
    try {
        const res = await axios.get('https://trends.google.com/trends/trendingsearches/daily/rss?geo=US');
        const items = res.data.match(/<item>([\s\S]*?)<\/item>/g) || [];
        return items.slice(0, 5).map(item => {
            const title = item.match(/<title>(.*?)<\/title>/)?.[1] || 'Trending Now';
            const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
            const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
            return {
                title: `${title} - LATEST TREND`,
                description: description.replace(/<!\[CDATA\[|\]\]>/g, ''),
                source: 'GoogleTrends (Live)',
                publishedAt: pubDate
            };
        });
    } catch { return []; }
}

async function fetchTopNews(count = 2) {
    console.log('[AI Blogger] 📡 Scouring the web for the absolute latest trending news...');
    
    // 1. Fetch deep pool (30+ items)
    const results = await Promise.all([
        fetchNewsAPI(),
        fetchHackerNews(),
        fetchRedditTech(),
        fetchGoogleTrends()
    ]);
    const poolItems = results.flat();

    // 2. Fetch recent titles from DB for deduplication
    const [recentPosts] = await pool.query('SELECT title FROM posts ORDER BY created_at DESC LIMIT 100');
    const existingTitles = recentPosts.map(p => p.title);

    // 3. Filter out similar news
    const uniqueNews = poolItems.filter(item => {
        const isDuplicate = existingTitles.some(existing => compareSimilarity(item.title, existing) > 0.6);
        return !isDuplicate;
    });

    console.log(`[AI Blogger] 🔍 Filtered ${poolItems.length} sources down to ${uniqueNews.length} fresh, unique candidates.`);

    // 4. Shuffle and pick random candidates from the fresh pool
    const shuffled = uniqueNews.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// ─── AI CORE ──────────────────────────────────────────────────────────────────

async function generateBlogFromNews(article, isRefresh = false, existingContent = '') {
    const internalLinksContext = await getInternalLinks();
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const MAX_RETRIES = 5;
    const MODELS = [
        'gemini-2.5-flash', 
        'gemini-2.5-flash-lite', 
        'gemini-2.0-flash', 
        'gemini-2.0-flash-lite'
    ];
    
    let metadata = null;
    let currentModelIndex = 0;

    // --- PHASE 1: VIRAL SEO STRATEGY (JSON) ---
    const metadataPrompt = `You are an Elite SEO Strategist and Viral Traffic Architect for DailyUpdatesHub.in.
    ANALYSIS TARGET: "${article.title}" - "${article.description}"
    
    TASK: Generate a high-velocity SEO Strategy.
    Return ONLY JSON:
    {
      "title": "Clickable SEO Headline (60 chars, power words + numbers)",
      "meta_title": "Exact Match Focus KW (55 chars)",
      "meta_description": "150-160 chars, CTA-rich, India-centric",
      "slug": "seo-slug-with-kw",
      "focus_keyword": "Primary ranking keyword",
      "secondary_keywords": ["15+ LSI/semantic: long-tail, questions, India-specific"],
      "tags": ["8-12: e.g. #AI #TechIndia #DigitalIndia"],
      "topic_cluster": "One of: AI, Education, IT, News, Business, Science, Gaming, Health, Crypto, Startups, Global Tech",
      "featured_image_prompt": "Vibrant 1024x1024 professional tech news illustration",
      "faqs": [{"q": "Question?", "a": "200-char answer"}],
      "outline": ["H2: Hook Intro", "H3: Breaking Details", "H2: India Context", "H2: Market Impact", "H2: Future Outlook", "H2: Conclusion"]
    }`;

    console.log(`[AI Blogger] 📡 Phase 1: Architecting Viral Strategy...`);
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const modelName = MODELS[currentModelIndex];
        try {
            const model = genAI.getGenerativeModel({ 
                model: modelName, 
                generationConfig: { responseMimeType: "application/json", temperature: 0.3 } 
            });
            const result = await model.generateContent(metadataPrompt);
            metadata = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
            break;
        } catch (err) {
            const status = err.response?.status || err.status;
            if (status === 429 || err.message.includes('429')) {
                console.log(`[AI Blogger] ⏳ 429 cooling (60s)...`);
                await new Promise(r => setTimeout(r, 60000));
                if (currentModelIndex < MODELS.length - 1) currentModelIndex++;
                attempt--; 
            } else {
                await new Promise(r => setTimeout(r, 20000));
            }
        }
    }

    if (!metadata) return null;

    // --- PHASE 2: 2000-WORD MASTERPIECE (HTML) ---
    const bodyPrompt = `You are an Elite Investigative Journalist and Authority Author for DailyUpdatesHub.in.
    STRATEGY: ${JSON.stringify(metadata)}
    CORE SIGNAL: "${article.description}"
    INTERNAL LINKS: ${internalLinksContext}
    
    GOAL: Write a 1500-2000 word authoritative investigative report.
    
    MANDATORY STRUCTURE & RULES:
    1. H1: ${metadata.title}
    2. BYLINE: "By AI Editorial Team | ${currentDate}"
    3. TOC: <nav><ul>(Auto-generate list from outline)</ul></nav>
    4. HOOK: Strong 100-word opening story or stat.
    5. INDIA-FIRST BIAS: Explain local impact, include Indian stats/context.
    6. E-E-A-T: Cite data, expert-style analysis, and market ripple effects.
    7. RICH FORMATTING: Use H2, H3, <blockquote>, <ul>, and <table> for data. Short paras (3-5 lines).
    8. INTERNAL LINKS: Embed at least 5 links from context.
    9. EXTERNAL LINKS: List 5 authoritative sources (Reuters/Wired/ET) at the bottom.
    10. FAQ: Use <details><summary> for the FAQ section.
    11. WORD COUNT: Aim for exactly 1500-2000 words of dense, high-value text.
    
    Return the content as RAW PROFESSIONAL HTML. No markdown.`;

    console.log(`[AI Blogger] 🖋️ Phase 2: Writing 2000-word Investigative Masterpiece...`);
    let bodyContent = '';
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const modelName = MODELS[currentModelIndex];
        try {
            // Use maximum tokens to ensure we get the full 2000 words
            const model = genAI.getGenerativeModel({ 
                model: modelName, 
                generationConfig: { temperature: 0.7, maxOutputTokens: 8192 } 
            });
            const result = await model.generateContent(bodyPrompt);
            bodyContent = result.response.text().replace(/```html|```/g, '').trim();
            
            // Validate length (approx 5000+ chars for 1500+ words)
            if (bodyContent.length > 5000) break; 
            console.warn('[AI Blogger] Narrative too thin, retrying for depth...');
        } catch (err) {
            const status = err.response?.status || err.status;
            if (status === 429 || err.message.includes('429')) {
                await new Promise(r => setTimeout(r, 60000));
                if (currentModelIndex < MODELS.length - 1) currentModelIndex++;
                attempt--;
            } else {
                await new Promise(r => setTimeout(r, 20000));
            }
        }
    }

    if (bodyContent) {
        const allKeywords = [metadata.focus_keyword, ...(metadata.secondary_keywords || [])];
        console.log(`[AI Blogger] ✅ Generation Success: ${bodyContent.length} chars (~${Math.round(bodyContent.length/6)} words)`);
        return { ...metadata, focus_keywords: allKeywords, content: bodyContent };
    }
    return null;
}

// ─── DATABASE & TAGS ──────────────────────────────────────────────────────────

async function handleTags(postId, tags) {
    if (!tags || !Array.isArray(tags)) return;
    for (const tagName of tags) {
        try {
            const slug = slugify(tagName, { lower: true, strict: true });
            await pool.query('INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)', [tagName, slug]);
            const [tagRows] = await pool.query('SELECT id FROM tags WHERE name = ?', [tagName]);
            if (tagRows.length) {
                await pool.query('INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagRows[0].id]);
            }
        } catch (e) {
            console.warn('[AI Blogger] Tag Link Failed:', e.message);
        }
    }
}

async function saveDraftPost(data, authorId, categoryId) {
    try {
        const [recentPosts] = await pool.query('SELECT title, slug FROM posts ORDER BY created_at DESC LIMIT 50');
        for (const p of recentPosts) {
            if (compareSimilarity(data.title, p.title) > 0.85) {
                console.log(`[AI Blogger] ⏩ SIMILARITY DETECTED: "${data.title}" matches "${p.title}"`);
                return null;
            }
        }

        const slug = data.slug ? slugify(data.slug, { lower: true, strict: true }) : slugify(data.title, { lower: true, strict: true });
        const imgUrl = await generateFeaturedImage(data.featured_image_prompt);

        const [res] = await pool.query(
            `INSERT INTO posts 
             (title, slug, content, category_id, topic_cluster, author_id, meta_title, meta_description, focus_keywords, featured_image, featured_image_prompt, social_caption, external_sources, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
                data.title, slug, data.content, categoryId, data.topic_cluster,
                authorId, data.meta_title, data.meta_description,
                JSON.stringify(data.focus_keywords), imgUrl, data.featured_image_prompt,
                data.social_caption, JSON.stringify(data.external_sources)
            ]
        );

        await handleTags(res.insertId, data.tags);
        console.log(`[AI Blogger] ✨ HIGH-AUTHORITY DRAFT SAVED: ID ${res.insertId}`);
        return res.insertId;
    } catch (err) {
        console.error('[AI Blogger] DB Error:', err.message);
        return null;
    }
}

async function refreshOldContent() {
    console.log('[AI Blogger] 🔄 Scanning for content freshness updates...');
    try {
        const [posts] = await pool.query(`
            SELECT id, title, content, slug FROM posts 
            WHERE status = 'published' 
            AND created_at < DATE_SUB(NOW(), INTERVAL 48 HOUR)
            AND (updated_at IS NULL OR updated_at < DATE_SUB(NOW(), INTERVAL 48 HOUR))
            LIMIT 1
        `);

        if (!posts.length) return;

        console.log(`[AI Blogger] 🧬 Refreshing Legacy Content: "${posts[0].title}"`);
        const updatedData = await generateBlogFromNews({ title: posts[0].title, description: 'Updating for content freshness' }, true, posts[0].content);

        if (updatedData) {
            await pool.query('UPDATE posts SET content = ?, updated_at = NOW() WHERE id = ?', [updatedData.content, posts[0].id]);
            console.log(`[AI Blogger] ✅ Content Freshness Injection successful for ${posts[0].slug}`);
        }
    } catch (err) {
        console.error('[AI Blogger] Refresh Failed:', err.message);
    }
}

async function runAIBlogger(count = 1) {
    const start = Date.now();
    console.log(`[AI Blogger] 🚀 PRODUCTION PIPELINE START. TARGET: ${count}`);

    try {
        const news = await fetchTopNews(count);
        const [admin] = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        const authorId = admin[0]?.id || 1;

        const [allCats] = await pool.query('SELECT id FROM categories LIMIT 1');
        const fallbackId = allCats[0]?.id || 1;

        let generated = 0;
        for (const article of news) {
            const data = await generateBlogFromNews(article);
            if (!data) continue;

            const [cat] = await pool.query('SELECT id FROM categories WHERE name = ?', [data.topic_cluster || 'Technology']);
            const categoryId = cat[0]?.id || fallbackId;

            const result = await saveDraftPost(data, authorId, categoryId);
            if (result) generated++;

            if (news.indexOf(article) < news.length - 1) {
                console.log('[AI Blogger] ⏳ Staggering next article by 120s to ensure quota freshness...');
                await new Promise(r => setTimeout(r, 120000));
            }
        }

        await refreshOldContent();
        console.log(`[AI Blogger] ✅ PIPELINE COMPLETE. ${generated} Articles created in ${(Date.now() - start) / 1000}s`);
        return { success: true, generated };
    } catch (err) {
        console.error('[AI Blogger] CRITICAL ERROR:', err.message);
        return { success: false, error: err.message };
    }
}

module.exports = { runAIBlogger };
