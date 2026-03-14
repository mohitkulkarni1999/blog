const axios = require('axios');
const slugify = require('slugify');
const pool = require('../config/db');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = 'gemini-2.5-flash';

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

        // This would return base64, usually we'd upload to Cloudinary
        // For brevity in this script, we'll return a placeholder if not fully integrated with Cloudinary upload
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

// ─── NEWS SIGNAL FETCHERS ────────────────────────────────────────────────────

async function fetchNewsAPI() {
    try {
        const categories = ['technology', 'business', 'science', 'gaming'];
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        const res = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: { language: 'en', category: randomCat, apiKey: process.env.NEWS_API_KEY, pageSize: 10 },
            timeout: 10000
        });
        return (res.data.articles || [])
            .filter(a => a.title && a.description && !a.title.includes('[Removed]'))
            .map(a => ({ title: a.title, description: a.description, source: `NewsAPI (${randomCat})` }));
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
                source: 'Reddit/r/technology'
            }));
    } catch { return []; }
}

async function fetchGoogleTrends() {
    try {
        const res = await axios.get('https://trends.google.com/trends/trendingsearches/daily/rss?geo=US');
        const items = res.data.match(/<title>(.*?)<\/title>/g) || [];
        return items.slice(2, 5).map(t => {
            const title = t.replace(/<\/?title>/g, '');
            return {
                title: `${title} - Trending Latest`,
                description: `Global trending topic: ${title}. High volume search intent detected.`,
                source: 'GoogleTrends'
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
    console.log(`[AI Blogger] 🕵️ Found ${news.length} potential signals. Selecting top ${count}...`);
    return news.sort(() => 0.5 - Math.random()).slice(0, count);
}

// ─── AI CORE ──────────────────────────────────────────────────────────────────

async function generateBlogFromNews(article, isRefresh = false, existingContent = '') {
    const internalLinks = await getInternalLinks();
    
    const prompt = `You are a Lead Investigative Reporter at The Verge. 
    ${isRefresh ? 'REFRESH TASK: Update this existing article with latest 2026 developments and better flow.' : 'NEW ARTICLE TASK: Write a massive, viral, 1,500-word tech news feature based on LATEST BREAKING NEWS.'}

    🚨 NEWS SIGNAL DATA (INCORPORATE THESE FACTS):
    NEWS TITLE: "${article.title}"
    NEWS CONTEXT/FACTS: "${article.description}"
    SOURCE CHANNEL: ${article.source}

    INTERNAL LINKS TO INJECT: ${internalLinks}
    ${isRefresh ? `EXISTING CONTENT: ${existingContent.substring(0, 2000)}...` : ''}

    STRICT EDITORIAL REQUIREMENTS:
    1. LATEST NEWS FOCUS: This is NOT an evergreen piece. It is a BREAKING NEWS analysis. Stay current.
    2. HEADLINE: Strong, emotional, Google Discover optimized (e.g., "The NVIDIA Revelation That Changes Everything").
    3. STRUCTURE: 1200-1800 words. Inverted pyramid intro answering Who/What/Where/When in the first 100 words.
    4. KEY TAKEAWAYS: A summary block with 4-5 high-impact bullets immediately after the intro.
    5. SECTIONS: Minimum 5 <h2> headings as consumer search queries. 1 detailed <h3> list of granular facts.
    6. ENGAGEMENT: Use 2-3 stylized blockquotes representing industry analysis. Use bolding for key terms.
    7. SEO: Provide Meta Title, Meta Description, Focus Keywords (3-5), and Tags (5-8).
    8. CLUSTERING: Categorize as: [AI, Technology, Gaming, Startups, Business, Science, Markets].
    9. IMAGE: Provide a cinematic, detailed featured_image_prompt.
    10. LINKS: Naturally embed the provided internal links using <a href="/blog/slug">text</a>.

    Return JSON:
    {
      "title": "...",
      "content": "Full HTML string...",
      "meta_title": "...",
      "meta_description": "...",
      "focus_keywords": ["..."],
      "tags": ["..."],
      "topic_cluster": "...",
      "featured_image_prompt": "..."
    }`;

    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[AI Blogger] 🤖 Contacting Gemini SDK (${GEMINI_MODEL}) - Attempt ${attempt}...`);
            const model = genAI.getGenerativeModel({ 
                model: GEMINI_MODEL,
                generationConfig: { 
                    responseMimeType: "application/json",
                    temperature: 0.8
                }
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            if (!text) throw new Error('Empty response from Gemini SDK');
            
            return JSON.parse(text);
        } catch (err) {
            const status = err.response?.status || err.status;
            console.error(`[AI Blogger] Gemini Error (Attempt ${attempt}):`, status || err.message);

            if (status === 429 || err.message.includes('429')) {
                const waitTime = attempt * 45000;
                console.warn(`[AI Blogger] ⏳ Rate limited. Waiting ${waitTime/1000}s...`);
                await new Promise(r => setTimeout(r, waitTime));
            } else if (attempt === MAX_RETRIES) {
                console.error('[AI Blogger] ❌ Max retries reached.');
                return null;
            } else {
                await new Promise(r => setTimeout(r, 5000));
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
        // 1. ADVANCED DUPLICATE CHECK
        const [recentPosts] = await pool.query('SELECT title, slug FROM posts ORDER BY created_at DESC LIMIT 50');
        for (const p of recentPosts) {
            if (compareSimilarity(data.title, p.title) > 0.85) {
                console.log(`[AI Blogger] ⏩ SIMILARITY DETECTED: "${data.title}" matches "${p.title}"`);
                return null;
            }
        }

        const slug = slugify(data.title, { lower: true, strict: true });
        const imgUrl = await generateFeaturedImage(data.featured_image_prompt);

        const [res] = await pool.query(
            `INSERT INTO posts 
             (title, slug, content, category_id, topic_cluster, author_id, meta_title, meta_description, focus_keywords, featured_image, featured_image_prompt, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
                data.title, slug, data.content, categoryId, data.topic_cluster,
                authorId, data.meta_title, data.meta_description, 
                JSON.stringify(data.focus_keywords), imgUrl, data.featured_image_prompt
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

// ─── FRESHNESS UPDATER ────────────────────────────────────────────────────────

async function refreshOldContent() {
    console.log('[AI Blogger] 🔄 Scanning for content freshness updates...');
    try {
        // Find posts older than 48 hours that haven't been updated recently
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

// ─── RUNNER ───────────────────────────────────────────────────────────────────

async function runAIBlogger(count = 1) {
    const start = Date.now();
    console.log(`[AI Blogger] 🚀 PRODUCTION PIPELINE START. TARGET: ${count}`);

    try {
        const news = await fetchTopNews(count);
        const [admin] = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        const authorId = admin[0]?.id || 1;

        let generated = 0;
        for (const article of news) {
            const data = await generateBlogFromNews(article);
            if (!data) continue;

            const [cat] = await pool.query('SELECT id FROM categories WHERE name = ?', [data.topic_cluster || 'Technology']);
            const categoryId = cat[0]?.id || 1;

            const result = await saveDraftPost(data, authorId, categoryId);
            if (result) generated++;

            if (news.indexOf(article) < news.length - 1) await new Promise(r => setTimeout(r, 60000));
        }

        // Run freshness update after main loop
        await refreshOldContent();

        console.log(`[AI Blogger] ✅ PIPELINE COMPLETE. ${generated} Articles created in ${(Date.now() - start) / 1000}s`);
        return { success: true, generated };
    } catch (err) {
        console.error('[AI Blogger] CRITICAL ERROR:', err.message);
        return { success: false, error: err.message };
    }
}

module.exports = { runAIBlogger };


