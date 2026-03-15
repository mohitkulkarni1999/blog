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
        const categories = ['technology', 'business', 'science', 'gaming'];
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        const res = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: { language: 'en', category: randomCat, apiKey: process.env.NEWS_API_KEY, pageSize: 12 },
            timeout: 10000
        });
        return (res.data.articles || [])
            .filter(a => a.title && a.description && !a.title.includes('[Removed]'))
            .map(a => ({
                title: a.title,
                description: a.description,
                source: `NewsAPI (${randomCat})`,
                publishedAt: a.publishedAt
            }));
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
    const results = await Promise.all([
        fetchNewsAPI(),
        fetchHackerNews(),
        fetchRedditTech(),
        fetchGoogleTrends()
    ]);
    const news = results.flat();
    const sortedNews = news.sort((a, b) => {
        const dateA = new Date(a.publishedAt || 0);
        const dateB = new Date(b.publishedAt || 0);
        return dateB - dateA;
    });
    return sortedNews.slice(0, count);
}

// ─── AI CORE ──────────────────────────────────────────────────────────────────

async function generateBlogFromNews(article, isRefresh = false, existingContent = '') {
    const internalLinks = await getInternalLinks();
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const prompt = `Act as a professional investigative journalist, SEO strategist, and global news editor for a high-traffic tech publication like Wired, Bloomberg, or TechCrunch.

    ${isRefresh ? 'REFRESH TASK: Update this existing article to include latest developments up to today.' : 'NEW ARTICLE TASK: Write a massive, viral, 1200-2000 word investigative report.'}

    🚨 LIVE NEWS SIGNAL (USE THESE FACTS AS THE CORE DATA):
    HEADLINE: "${article.title}"
    CONTEXT/DATA: "${article.description}"
    TIMESTAMP: ${article.publishedAt || currentDate}
    CHANNEL: ${article.source}

    INTERNAL LINKS TO EMBED: ${internalLinks}
    ${isRefresh ? `EXISTING CONTENT TO UPDATE: ${existingContent.substring(0, 2000)}...` : ''}

    ARTICLE STRUCTURE & CONTENT REQUIREMENTS:
    1. Attention-grabbing headline (H1).
    2. Author: AI News Desk | Date: ${currentDate}.
    3. Key Takeaways: 3–5 high-impact bullet points.
    4. Introduction: Engaging opening paragraph explaining the breaking news.
    5. Table of Contents (HTML List with internal links to headings).
    6. The Breaking Development: Detailed section on the latest news.
    7. Industry Context: Technology/Industry background and history.
    8. Economic Pulse: Market and economic impact analysis.
    9. Global Ripple Effects: Broad implications for society and the world.
    10. The Road Ahead: Future outlook and predictions.
    11. Final Verdict: Conclusion wrapping up the narrative.

    STRICT EDITORIAL RULES:
    - LENGTH: 1200–2000 words of dense, high-value text.
    - NO FAKE EXPERTS/QUOTES: Analyze the situation based on facts, do not fabricate people.
    - ACCURACY: Stick to the facts in the news signal. No conspiracy theories.
    - SEO: Use H1, H2, and H3 tags naturally. Optimized for Google Discover.
    - FORMATTING: Return well-structured HTML inside the "content" field.

    Return JSON:
    {
      "title": "...",
      "content": "Full HTML string summarizing the entire article structure...",
      "meta_title": "SEO Optimized Title",
      "meta_description": "Compelling Meta Description (150-160 chars)",
      "focus_keywords": ["8-10 specific SEO keywords"],
      "tags": ["10+ descriptive tags"],
      "topic_cluster": "One of: Technology, AI, Crypto, Energy, Business, Startups, Gaming, Internet Culture, Science, Global Trends",
      "featured_image_prompt": "Ultra-detailed realistic photo prompt for the header image",
      "social_caption": "Engaging social media post for X/LinkedIn",
      "slug": "seo-friendly-url-slug",
      "external_sources": ["Source 1 Name (URL)", "Source 2 Name (URL)"]
    }`;

    const MAX_RETRIES = 5;
    const MODEL_TO_USE = 'gemini-2.5-flash';
    console.log(`[AI Blogger] ⏳ Preparing AI session (${MODEL_TO_USE})...`);
    await new Promise(r => setTimeout(r, 10000 + Math.random() * 5000));

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[AI Blogger] 🤖 Contacting Gemini SDK (${MODEL_TO_USE}) - Attempt ${attempt}...`);
            const model = genAI.getGenerativeModel({
                model: MODEL_TO_USE,
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.4,
                    maxOutputTokens: 8192
                }
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            if (!text) throw new Error('Empty response from Gemini SDK');

            // Defensive JSON cleaning
            text = text.replace(/```json|```/g, '').trim();
            
            try {
                return JSON.parse(text);
            } catch (pErr) {
                console.warn('[AI Blogger] JSON.parse failed. Initiating Deep Structural Repair...');
                
                // Deep Repair Logic: Handles unterminated strings AND missing braces
                let repaired = text;
                
                // 1. Handle Unterminated String: Count unescaped quotes
                const quotes = repaired.match(/(?<!\\)"/g) || [];
                if (quotes.length % 2 !== 0) {
                    repaired += '"'; 
                }

                // 2. Handle Truncated Structure: Brute-force append missing closures
                for (let i = 0; i < 5; i++) {
                    try {
                        return JSON.parse(repaired);
                    } catch (e) {
                        repaired += '}'; // Try closing the bracket
                    }
                }

                // 3. Last Resort: Find the last valid key-value pair boundary
                const lastValidBrace = text.lastIndexOf('}');
                if (lastValidBrace !== -1) {
                    try {
                        return JSON.parse(text.substring(0, lastValidBrace + 1));
                    } catch (e) {
                        throw new Error(`JSON Recovery Failed: ${pErr.message}`);
                    }
                }
                throw pErr;
            }
        } catch (err) {
            const status = err.response?.status || err.status;
            const errorMessage = err.message || '';
            console.error(`[AI Blogger] Gemini Error (Attempt ${attempt}):`, status || errorMessage);

            if (status === 429 || errorMessage.includes('429')) {
                const waitTime = Math.pow(2, attempt) * 60000 + Math.random() * 30000;
                console.warn(`[AI Blogger] ⏳ Rate limited. Deep cooling for ${Math.round(waitTime / 1000)}s...`);
                await new Promise(r => setTimeout(r, waitTime));
            } else if (status === 400 && (errorMessage.includes('expired') || errorMessage.includes('key'))) {
                console.error('[AI Blogger] 🚨 API KEY ERROR: Please verify the key in .env matches the active project.');
                return null;
            } else if (attempt === MAX_RETRIES) {
                console.error('[AI Blogger] ❌ Max retries reached.');
                return null;
            } else {
                await new Promise(r => setTimeout(r, 15000));
            }
        }
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
