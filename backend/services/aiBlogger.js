const axios = require('axios');
const slugify = require('slugify');
const pool = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── CONFIGURATION & MODELS ──────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let isProcessing = false; 
let processingStart = null;
let currentProgress = 'Idle';

function getBloggerStatus() {
    return {
        isProcessing,
        progress: currentProgress,
        uptime: isProcessing ? Math.round((Date.now() - processingStart) / 1000) : 0
    };
}

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
        const cat = ['technology', 'business', 'science'][Math.floor(Math.random() * 3)];
        const res = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: { language: 'en', category: cat, apiKey: process.env.NEWS_API_KEY, pageSize: 12 },
            timeout: 5000 // Fast timeout
        });
        return (res.data.articles || []).map(a => ({
            title: a.title,
            description: a.description,
            source: `NewsAPI (${cat})`,
            publishedAt: a.publishedAt
        })).filter(a => a.title && a.description && !a.title.includes('[Removed]'));
    } catch (err) {
        console.error('[AI Blogger] NewsAPI Quick Fetch Failed');
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

async function fetchGoogleNewsRSS(query = 'technology') {
    try {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
        const res = await axios.get(url, { timeout: 10000 });
        const items = res.data.match(/<item>([\s\S]*?)<\/item>/g) || [];
        return items.slice(0, 5).map(item => {
            const title = item.match(/<title>(.*?)<\/title>/)?.[1] || '';
            const description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
            const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
            const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
            return {
                title: title.split(' - ')[0], // Remove the source suffix
                description: description.replace(/<[^>]+>/g, '').substring(0, 400),
                source: `Google News (${query})`,
                publishedAt: pubDate,
                url: link
            };
        });
    } catch { return []; }
}

async function fetchYouTubeTrending() {
    try {
        const API_KEY = process.env.YOUTUBE_API_KEY;
        if (!API_KEY) {
            console.warn('[AI Blogger] ⚠️ YOUTUBE_API_KEY missing. Skipping YouTube source.');
            return [];
        }
        const res = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=5&videoCategoryId=28&key=${API_KEY}`);
        return (res.data.items || []).map(item => ({
            title: item.snippet.title,
            description: item.snippet.description.substring(0, 400),
            source: 'YouTube Trending (Tech)',
            publishedAt: item.snippet.publishedAt
        }));
    } catch { return []; }
}

async function fetchTopNews(count = 5) {
    console.log('[AI Blogger] 📡 Scouring high-priority tech signals...');
    
    // 1. Fetch deep pool from 8 curated niches (Speed Optimized)
    const queries = [
        'technology', 'artificial intelligence', 'semiconductors', 
        'cybersecurity', 'crypto news', 'space technology', 
        'India startups', 'internet culture'
    ];

    const results = await Promise.all([
        fetchNewsAPI(),
        fetchHackerNews(),
        fetchRedditTech(),
        fetchGoogleTrends(),
        fetchYouTubeTrending(),
        ...queries.map(q => fetchGoogleNewsRSS(q))
    ]);
    const poolItems = results.flat();

    // 2. Fetch recent titles from DB for deduplication (heavy lookback)
    const [recentPosts] = await pool.query('SELECT title FROM posts ORDER BY created_at DESC LIMIT 200');
    const existingTitles = recentPosts.map(p => p.title);

    // 3. Filter out similar news and enforce STRICT 24-HOUR FRESHNESS
    const now = new Date();
    const uniqueNews = poolItems.filter(item => {
        // Freshness Check
        if (item.publishedAt) {
            const pubDate = new Date(item.publishedAt);
            const hoursOld = (now - pubDate) / (1000 * 60 * 60);
            if (hoursOld > 24) return false; // Discard "old" news (>24h)
        }

        // Duplication Check
        const isDuplicate = existingTitles.some(existing => compareSimilarity(item.title, existing) > 0.6);
        return !isDuplicate;
    });

    console.log(`[AI Blogger] 🔍 Freshness Validated: Found ${uniqueNews.length} articles published in the last 24 hours.`);

    // 4. Shuffle and pick high-priority candidates
    const shuffled = uniqueNews.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// ─── AI CORE ──────────────────────────────────────────────────────────────────

async function generateBlogFromNews(article, variant = 'primary') {
    const internalLinksContext = await getInternalLinks();
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const MAX_RETRIES = 5;
    const MODELS = [
        'gemini-1.5-flash', // Highest RPM for free tier
        'gemini-2.0-flash', 
        'gemini-1.5-flash-8b'
    ];
    
    let metadata = null;
    let currentModelIndex = 0;

    // --- PHASE 1: ELITE SEO BLUEPRINT ---
    const metadataPrompt = `You are an elite SEO strategist for DailyUpdatesHub.in.
Analyze signal: "${article.title}" - "${article.description}"
Return ONLY JSON:
{
  "title": "Headline for Google Discover",
  "meta_title": "SEO Title",
  "meta_description": "160 char CTA",
  "slug": "seo-slug",
  "focus_keyword": "keyword",
  "secondary_keywords": ["10 semantic keywords"],
  "tags": ["social tags"],
  "topic_cluster": "Technology | AI | Business | Science",
  "featured_image_prompt": "photorealistic photo for the topic",
  "faqs": [{"q":"q","a":"a"}],
  "outline": ["H2: Overview", "H2: Detailed Report", "H2: Why It Matters", "H2: India Angle", "H2: Conclusion"]
}`;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const modelName = MODELS[currentModelIndex];
        try {
            console.log(`[AI Blogger] 🤖 Blueprint Attempt ${attempt} (${modelName})...`);
            const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: "application/json", temperature: 0.3 } });
            const result = await model.generateContent(metadataPrompt);
            const textResponse = result.response.text().replace(/```json|```/g, '').trim();
            metadata = JSON.parse(textResponse);
            console.log(`[AI Blogger] ✅ Blueprint Parsed: "${metadata.title}"`);
            break;
        } catch (err) {
            console.error(`[AI Blogger] ❌ Blueprint Error (${modelName}):`, err.message);
            const status = err.response?.status || err.status;
            if ((status === 429 || err.message.includes('429')) && currentModelIndex < MODELS.length - 1) {
                const waitTime = isProcessing && processingStart && (Date.now() - processingStart < 35000) ? 15000 : 60000;
                console.log(`[AI Blogger] ⏳ Quota full, retrying in ${waitTime/1000}s with next model...`);
                await new Promise(r => setTimeout(r, waitTime));
                currentModelIndex++;
                attempt--; 
            } else {
                await new Promise(r => setTimeout(r, 10000));
            }
        }
    }

    if (!metadata) {
        console.error('[AI Blogger] 🚫 Metadata generation failed after all retries.');
        return null;
    }

    // --- PHASE 2: MASTERPIECE ---
    const bodyPrompt = `You are a senior investigative journalist for DailyUpdatesHub.in.
Write a 1500-2000 word deep-dive article in RAW HTML for: "${metadata.title}".
Context: "${article.description}"
Include: TOC, Introduction, Outline sections, India perspective, Conclusion, FAQs.
FORMAT: HTML only.`;

    let bodyContent = '';
    console.log(`[AI Blogger] 🖋️ Drafting narrative masterpiece...`);
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const modelName = MODELS[currentModelIndex];
        try {
            const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { temperature: 0.7, maxOutputTokens: 8192 } });
            const result = await model.generateContent(bodyPrompt);
            bodyContent = result.response.text().replace(/```html|```/g, '').trim();
            if (bodyContent.length > 5000) {
                console.log(`[AI Blogger] ✅ Narrative Success (${bodyContent.length} chars)`);
                break;
            }
            console.warn(`[AI Blogger] ⚠️ Content too short (${bodyContent.length}), retrying...`);
        } catch (err) {
            console.error(`[AI Blogger] ❌ Narrative Error (${modelName}):`, err.message);
            const status = err.response?.status || err.status;
            if ((status === 429 || err.message.includes('429')) && currentModelIndex < MODELS.length - 1) {
                const waitTime = isProcessing && processingStart && (Date.now() - processingStart < 120000) ? 60000 : 120000;
                await new Promise(r => setTimeout(r, waitTime));
                currentModelIndex++;
                attempt--;
            } else {
                await new Promise(r => setTimeout(r, 15000));
            }
        }
    }

    if (bodyContent) {
        const allKeywords = [metadata.focus_keyword, ...(metadata.secondary_keywords || [])];
        return { 
            ...metadata, 
            focus_keywords: allKeywords, 
            content: bodyContent,
            social_caption: `Deep dive into ${metadata.title}`,
            external_sources: []
        };
    }
    console.error('[AI Blogger] 🚫 Narrative generation failed.');
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
        const [recentPosts] = await pool.query('SELECT title, slug FROM posts ORDER BY created_at DESC LIMIT 150');
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
        console.log(`[AI Blogger] ✨ DRAFT SAVED: ID ${res.insertId} - "${data.title}"`);
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
        const updatedData = await generateBlogFromNews({ title: posts[0].title, description: 'Updating for content freshness' });

        if (updatedData) {
            await pool.query('UPDATE posts SET content = ?, updated_at = NOW() WHERE id = ?', [updatedData.content, posts[0].id]);
            console.log(`[AI Blogger] ✅ Content Freshness Injection successful for ${posts[0].slug}`);
        }
    } catch (err) {
        console.error('[AI Blogger] Refresh Failed:', err.message);
    }
}

async function runAIBlogger(count = 5, isManual = false) {
    if (isProcessing) {
        console.log(`[AI Blogger] 🛑 Traffic Block: Already processing "${currentProgress}"`);
        return { success: false, error: 'Locked', status: currentProgress };
    }
    
    isProcessing = true;
    processingStart = Date.now();
    currentProgress = 'Scouring latest tech...';
    
    try {
        const news = await fetchTopNews(count);
        const [admin] = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        const authorId = admin[0]?.id || 1;

        const [allCats] = await pool.query('SELECT id FROM categories LIMIT 1');
        const fallbackId = allCats[0]?.id || 1;

        let generated = 0;
        console.log(`[AI Blogger] 🎯 Target Sequence: ${news.length} signals found.`);
        for (let i = 0; i < news.length; i++) {
            const article = news[i];
            
            // Manual Mode: One masterpiece immediately. Automated: Traffic Multiplier.
            const variants = isManual ? ['primary'] : ['primary', 'explainer', 'comparison'];
            
            for (let v = 0; v < variants.length; v++) {
                const variant = variants[v];
                currentProgress = isManual ? 'Generating Masterpiece...' : `Signal ${i + 1}/${news.length} - ${variant.toUpperCase()}`;
                console.log(`[AI Blogger] ⏳ Progress: ${currentProgress} ("${article.title}")`);
                
                const data = await generateBlogFromNews(article, variant);
                if (!data) {
                    console.error(`[AI Blogger] 🚫 Signal ${i+1} variant ${variant} failed generation.`);
                    continue;
                }

                let targetCategory = data.topic_cluster;
                if (targetCategory && targetCategory.includes('|')) targetCategory = targetCategory.split('|')[0].trim();
                
                const [cat] = await pool.query('SELECT id FROM categories WHERE name = ?', [targetCategory || 'Technology']);
                const categoryId = cat[0]?.id || fallbackId;

                console.log(`[AI Blogger] 💾 Saving to DB...`);
                const result = await saveDraftPost(data, authorId, categoryId);
                if (result) {
                    generated++;
                    console.log(`[AI Blogger] ✅ Successfully created: draft ID ${result}`);
                } else {
                    console.error(`[AI Blogger] ❌ Failed to save draft for: "${data.title}"`);
                }

                if (!isManual && v < variants.length - 1) {
                    await new Promise(r => setTimeout(r, 45000));
                }
            }

            if (!isManual && i < news.length - 1) {
                currentProgress = `Next signal prep...`;
                await new Promise(r => setTimeout(r, 60000));
            }

            if (isManual) break;
        }

        currentProgress = 'Processing freshness updates...';
        await refreshOldContent();
        console.log(`[AI Blogger] ✅ PIPELINE COMPLETE. ${generated} Articles created.`);
        return { success: true, generated };
    } catch (err) {
        console.error('[AI Blogger] CRITICAL ERROR:', err.message);
        return { success: false, error: err.message };
    } finally {
        isProcessing = false;
        currentProgress = 'Idle';
    }
}

module.exports = { runAIBlogger, getBloggerStatus };
