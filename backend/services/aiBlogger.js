const axios = require('axios');
const slugify = require('slugify');
const pool = require('../config/db');

// ─── CONFIGURATION & MODELS ──────────────────────────────────────────────────
const GEMINI_MODEL = 'gemini-2.5-flash'; // High-context window model confirmed working
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ─── MULTI-SOURCE NEWS FETCHING ───────────────────────────────────────────────

/**
 * Fetch from NewsAPI (Standard)
 */
async function fetchNewsAPI(count = 2) {
    try {
        const silos = ['technology', 'business', 'science', 'gaming'];
        const randomSilo = silos[Math.floor(Math.random() * silos.length)];
        
        const res = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                language: 'en',
                category: randomSilo,
                pageSize: 10,
                apiKey: process.env.NEWS_API_KEY,
            },
            timeout: 10000
        });

        return (res.data.articles || [])
            .filter(a => a.title && a.description && !a.title.includes('[Removed]'))
            .map(a => ({ title: a.title, description: a.description, source: 'NewsAPI', url: a.url }));
    } catch (err) {
        console.error('[AI Blogger] NewsAPI Error:', err.message);
        return [];
    }
}

/**
 * Fetch from Hacker News (Elite Tech)
 */
async function fetchHackerNews(count = 2) {
    try {
        const { data: topIds } = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const articles = [];
        
        for (const id of topIds.slice(0, 10)) {
            const { data: item } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            if (item && item.title && (item.url || item.text)) {
                articles.push({
                    title: item.title,
                    description: item.text ? item.text.substring(0, 200) : `Hacker News discussion on ${item.title}`,
                    source: 'HackerNews',
                    url: item.url || `https://news.ycombinator.com/item?id=${id}`
                });
            }
            if (articles.length >= count) break;
        }
        return articles;
    } catch (err) {
        console.error('[AI Blogger] HN Error:', err.message);
        return [];
    }
}

/**
 * Fetch from Reddit r/technology (Trending)
 */
async function fetchRedditTech(count = 2) {
    try {
        const res = await axios.get('https://www.reddit.com/r/technology/hot.json?limit=10', {
            headers: { 'User-Agent': 'DailyUpdatesHub/1.0' }
        });
        
        return res.data.data.children
            .filter(child => !child.data.stickied && child.data.title)
            .slice(0, count)
            .map(child => ({
                title: child.data.title,
                description: child.data.selftext ? child.data.selftext.substring(0, 200) : `Hot discussion on r/technology: ${child.data.title}`,
                source: 'Reddit',
                url: `https://reddit.com${child.data.permalink}`
            }));
    } catch (err) {
        console.error('[AI Blogger] Reddit Error:', err.message);
        return [];
    }
}

/**
 * Fetch from Google Trends (RSS)
 */
async function fetchGoogleTrends(count = 2) {
    try {
        const res = await axios.get('https://trends.google.com/trends/trendingsearches/daily/rss?geo=US');
        const items = res.data.match(/<title>(.*?)<\/title>/g) || [];
        const trends = items.slice(2, 2 + count).map(t => {
            const title = t.replace(/<\/?title>/g, '');
            return {
                title: `${title} - Trending Now`,
                description: `Analysis of why ${title} is trending today in technology and business.`,
                source: 'GoogleTrends',
                url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}`
            };
        });
        return trends;
    } catch (err) {
        console.error('[AI Blogger] Trends Error:', err.message);
        return [];
    }
}

/**
 * Combined Source Fetcher
 */
async function fetchTopNews(count = 4) {
    console.log('[AI Blogger] 📡 Gathering news from multiple signals...');
    const newsPromises = [
        fetchNewsAPI(3),
        fetchHackerNews(3),
        fetchRedditTech(3),
        fetchGoogleTrends(3)
    ];

    const results = await Promise.all(newsPromises);
    const flatNews = results.flat();
    
    // Shuffle and pick
    return flatNews.sort(() => 0.5 - Math.random()).slice(0, count);
}

// ─── AI CONTENT GENERATION ────────────────────────────────────────────────────

async function generateBlogFromNews(article) {
    const prompt = `You are a Senior Editor at TechCrunch and Wired. Write a world-class, 1,200 to 1,800-word authoritative tech article.
    
    TOPIC: "${article.title}"
    CONTEXT: "${article.description}"
    SOURCE SIGNAL: ${article.source}
    
    STRICT STRUCTURAL REQUIREMENTS:
    1. INTRO: First 120 words must follow the "Inverted Pyramid" style. Answer "What, Who, When, Where, Why" immediately for Featured Snippets.
    2. KEY TAKEAWAYS: Immediately after intro, add a block titled "Key Takeaways" with 4-5 high-impact bullet points.
    3. TABLE OF CONTENTS: Generate a <ul> list with links (#sub-1, #sub-2 etc) to internal headings.
    4. HEADINGS: Use minimum five (5) <h2> headings. Write them as HIGH-VOLUME SEARCH QUERIES (e.g., "Will AI Replace Software Engineers?"). Assign IDs to them.
    5. ANALYSIS: One <h3> section must contain a detailed 8-10 point technical bullet list.
    6. TONE: Aggressive, insightful, conversational but expert (TechCrunch style). Use industry analysis, not just summary.
    7. QUOTES: Include 2-3 expert-style <blockquote> blocks from "Anonymous Industry Analysts" or "Senior Engineers" providing critical commentary.
    8. INTERNAL LINKS: Embed 2-3 placeholder internal links using format <a href="/blog/related-slug">text</a>.
    9. FEATURED IMAGE PROMPT: Create a detailed 50-word cinematic prompt for an AI image generator (like Flux or Midjourney) describing a futuristic visualization of this topic.
    10. CONCLUSION: A powerful "The Road Ahead" closing section.
    
    RELIABILITY RULES:
    - Minimum 1,200 words. Keep prose rich and verbose.
    - No repetition.
    - Validate that the output ends cleanly and doesn't cut off.

    Return ONLY a valid JSON object:
    {
      "title": "Enter dynamic H1 title",
      "content": "Full HTML response with <h2>, <ul>, <blockquote>, etc.",
      "meta_title": "SEO title < 60 chars",
      "meta_description": "SEO desc < 160 chars",
      "category_suggestion": "AI, Technology, Gaming, Business, Startups, Science, or Markets",
      "featured_image_prompt": "Cinematic 3D render of..."
    }`;

    const MAX_RETRIES = 3;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[AI Blogger] 🤖 Generating content (Attempt ${attempt}/3)...`);
            const response = await axios.post(
                `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { 
                        temperature: 0.75, 
                        maxOutputTokens: 8192,
                        responseMimeType: "application/json"
                    }
                },
                { timeout: 150000 }
            );

            const data = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!data) throw new Error('Null response from Gemini');

            const parsed = JSON.parse(data);
            
            // Validate word count roughly
            const wordCount = parsed.content.split(/\s+/).length;
            if (wordCount < 600) { // Safety check, though prompt asks for more
                console.warn(`[AI Blogger] ⚠️ Content seems too short (${wordCount} words). Retrying...`);
                continue;
            }

            return parsed;

        } catch (error) {
            console.error(`[AI Blogger] Gemini Error (Attempt ${attempt}):`, error.message);
            if (error.response?.status === 429) {
                await new Promise(r => setTimeout(r, 60000 * attempt)); // Wait 1min, 2min...
            }
            if (attempt === MAX_RETRIES) return null;
        }
    }
}

// ─── DATABASE LOGIC ───────────────────────────────────────────────────────────

async function getOrCreateCategory(name) {
    const validCategories = ['AI', 'Technology', 'Gaming', 'Business', 'Startups', 'Science', 'Markets'];
    const finalName = validCategories.find(c => c.toLowerCase() === name.toLowerCase()) || 'Technology';
    
    try {
        const [rows] = await pool.query('SELECT id FROM categories WHERE name = ?', [finalName]);
        if (rows.length) return rows[0].id;

        const slug = slugify(finalName, { lower: true, strict: true });
        const [res] = await pool.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [finalName, slug]);
        return res.insertId;
    } catch (err) {
        return 1;
    }
}

async function saveDraftPost(blogData, authorId, categoryId) {
    try {
        // 1. DUPLICATE CHECK
        const [existing] = await pool.query('SELECT id FROM posts WHERE title = ?', [blogData.title]);
        if (existing.length) {
            console.log(`[AI Blogger] ⏩ Skipping duplicate: "${blogData.title}"`);
            return null;
        }

        // 2. SLUG UNIQUE
        let slug = slugify(blogData.title, { lower: true, strict: true });
        const [existingSlug] = await pool.query('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existingSlug.length) slug = `${slug}-${Date.now().toString().slice(-4)}`;

        // 3. READING TIME
        const wordCount = blogData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 225);

        // 4. INSERT
        const [res] = await pool.query(
            `INSERT INTO posts 
             (title, slug, content, category_id, author_id, meta_title, meta_description, status, featured_image_prompt, reading_time) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
            [
                blogData.title,
                slug,
                blogData.content,
                categoryId,
                authorId,
                blogData.meta_title,
                blogData.meta_description,
                blogData.featured_image_prompt,
                readingTime
            ]
        );

        console.log(`[AI Blogger] ✨ Draft created: ID ${res.insertId} | ${wordCount} words`);
        return res.insertId;
    } catch (err) {
        console.error('[AI Blogger] DB Insert Failed:', err.message);
        return null;
    }
}

// ─── RUNNER ───────────────────────────────────────────────────────────────────

async function runAIBlogger(count = 2) {
    console.log(`[AI Blogger] 🚀 AI Startup Initiated. Generating ${count} high-grade articles...`);
    
    try {
        const news = await fetchTopNews(count);
        if (!news.length) return { success: false, generated: 0 };

        // Get admin ID
        const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        const authorId = admins.length ? admins[0].id : 1;

        let generated = 0;
        for (const article of news) {
            console.log(`[AI Blogger] 🏗️ Constructing: "${article.title}" [Signal: ${article.source}]`);
            
            const blogData = await generateBlogFromNews(article);
            if (!blogData) continue;

            const categoryId = await getOrCreateCategory(blogData.category_suggestion);
            const postId = await saveDraftPost(blogData, authorId, categoryId);
            
            if (postId) generated++;

            // Rate limit delay (30s between posts for safety)
            if (news.indexOf(article) < news.length - 1) {
                console.log('[AI Blogger] ⏳ Cooling down for 30s...');
                await new Promise(r => setTimeout(r, 30000));
            }
        }

        console.log(`[AI Blogger] ✅ Generation cycle complete. Created ${generated} articles.`);
        return { success: true, generated };
    } catch (err) {
        console.error('[AI Blogger] Fatal Cycle Error:', err.message);
        return { success: false, error: err.message };
    }
}

module.exports = { runAIBlogger };

