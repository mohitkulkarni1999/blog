const axios = require('axios');
const slugify = require('slugify');
const pool = require('../config/db');

// ─── CONFIGURATION & MODELS ──────────────────────────────────────────────────
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

async function fetchNewsAPI() {
    try {
        const res = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: { language: 'en', category: 'technology', apiKey: process.env.NEWS_API_KEY },
            timeout: 8000
        });
        return (res.data.articles || []).slice(0, 3).map(a => ({ title: a.title, description: a.description, source: 'NewsAPI' }));
    } catch { return []; }
}

async function fetchHackerNews() {
    try {
        const { data: topIds } = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const articles = [];
        for (const id of topIds.slice(0, 5)) {
            const { data: item } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            if (item && item.title) articles.push({ title: item.title, description: item.text || item.title, source: 'HackerNews' });
        }
        return articles;
    } catch { return []; }
}

async function fetchTopNews(count = 2) {
    console.log('[AI Blogger] 📡 Scouring the web for high-signal topics...');
    const news = [...(await fetchNewsAPI()), ...(await fetchHackerNews())];
    return news.sort(() => 0.5 - Math.random()).slice(0, count);
}

// ─── AI CORE ──────────────────────────────────────────────────────────────────

async function generateBlogFromNews(article, isRefresh = false, existingContent = '') {
    const internalLinks = await getInternalLinks();
    
    const prompt = `You are a Senior Editorial Architect at The Verge. 
    ${isRefresh ? 'REFRESH TASK: Update this existing article with latest 2026 developments and better flow.' : 'NEW ARTICLE TASK: Write a viral, 1,500-word tech feature.'}

    TOPIC: "${article.title}"
    INTERNAL LINKS TO INJECT: ${internalLinks}
    ${isRefresh ? `EXISTING CONTENT: ${existingContent.substring(0, 2000)}...` : ''}

    STRICT SEO & QUALITY REQUIREMENTS:
    1. HEADLINE: Strong, emotional, Google Discover optimized (e.g., "The NVIDIA Revelation That Changes Everything").
    2. STRUCTURE: 1200-1800 words. Inverted pyramid intro. "Key Takeaways" section. Automatic Table of Contents.
    3. SECTIONS: Minimum 5 <h2> headings as search queries. 1 detailed <h3> list.
    4. ENGAGEMENT: Stylized blockquotes from analysts. Aggressive, investigative tone.
    5. SEO: Meta tags, Focus Keywords (3-5), and Tags (5-8).
    6. CLUSTERING: Suggest one cluster from: [AI, Technology, Gaming, Startups, Business, Science, Markets].
    7. IMAGE: Provide a cinematic, detailed featured_image_prompt.
    8. LINKS: Naturally embed the provided internal links using <a href="/blog/slug">text</a>.

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

    try {
        console.log(`[AI Blogger] 🤖 Contacting Gemini Core (${GEMINI_MODEL})...`);
        const res = await axios.post(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, responseMimeType: "application/json" }
        }, { timeout: 180000 });

        return JSON.parse(res.data.candidates[0].content.parts[0].text);
    } catch (err) {
        console.error('[AI Blogger] Gemini Generation Failed:', err.message);
        return null;
    }
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


