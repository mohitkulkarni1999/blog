const axios = require('axios');
const slugify = require('slugify');
const pool = require('../config/db');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

// ─── Fetch top news headlines ─────────────────────────────────────────────────
async function fetchTopNews(count = 2) {
    try {
        // Build topical authority in 2 specific silos: Technology & Business
        const silos = ['technology', 'business'];
        const randomSilo = silos[Math.floor(Math.random() * silos.length)];

        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                language: 'en',
                category: randomSilo,
                pageSize: 15,
                apiKey: process.env.NEWS_API_KEY,
            },
            timeout: 10000,
        });

        const articles = response.data.articles
            .filter(a => a.title && a.description && !a.title.includes('[Removed]'))
            .slice(0, count);

        return articles;
    } catch (error) {
        console.error('[AI Blogger] Failed to fetch news:', error.message);
        return [];
    }
}

// ─── Generate a full blog post using Gemini REST API ─────────────────────────
async function generateBlogFromNews(article) {
    const prompt = `You are a Senior Tech/Business Journalist writing for DailyUpdatesHub.
Based on this news headline, write a highly detailed, magazine-style professional news article. 
You MUST write at least 800 words to avoid 'Thin Content' penalties.

NEWS HEADLINE: "${article.title}"
NEWS DESCRIPTION: "${article.description}"
DATE: ${new Date().toDateString()}

FORMAT STRICTLY IN HTML. Must include:
1. A brief introductory hook paragraph.
2. A "Key Takeaways" bulleted list (<ul>) right after the intro.
3. At least 3 different <h2> subheadings dividing the story into logical sections (Context, Data/Impact, Future).
4. A "Why This Matters" or "The Bigger Picture" <h3> section at the very end analyzing the impact.
5. Rich formatting: use <strong> for emphasis and <blockquote> for quotes if relevant.

Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with these exact fields:
{
  "title": "engaging, click-worthy SEO blog post title",
  "content": "Full HTML blog post fitting the rules above, minimum 800 words",
  "meta_title": "SEO meta title under 60 characters",
  "meta_description": "SEO meta description under 160 characters analyzing the impact",
  "category_suggestion": "Technology or Business"
}`;

    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await axios.post(
                `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
                },
                { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
            );

            const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('Empty response from Gemini');

            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return parsed;

        } catch (error) {
            const status = error.response?.status;
            const errMsg = error.response?.data?.error?.message || error.message;

            if (status === 401 || status === 403) {
                console.error('[AI Blogger] ❌ Invalid Gemini API key — update GEMINI_API_KEY in Render env vars');
                return null; // No point retrying
            } else if (status === 429) {
                const waitSec = attempt * 30; // 30s, 60s, 90s
                console.warn(`[AI Blogger] ⏳ Rate limited (attempt ${attempt}/${MAX_RETRIES}) — waiting ${waitSec}s...`);
                if (attempt < MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, waitSec * 1000));
                } else {
                    console.error('[AI Blogger] ❌ Rate limit exceeded after all retries. Try again in a few minutes.');
                    return null;
                }
            } else {
                console.error(`[AI Blogger] Gemini failed (${status}): ${errMsg}`);
                return null;
            }
        }
    }
    return null;
}

// ─── Find or create a category in DB ─────────────────────────────────────────
async function getOrCreateCategory(categoryName) {
    try {
        const [existing] = await pool.query('SELECT id FROM categories WHERE name = ?', [categoryName]);
        if (existing.length) return existing[0].id;

        const slug = slugify(categoryName, { lower: true, strict: true });
        const [result] = await pool.query(
            'INSERT INTO categories (name, slug) VALUES (?, ?)',
            [categoryName, slug]
        );
        return result.insertId;
    } catch (error) {
        console.error('[AI Blogger] Category error:', error.message);
        return null;
    }
}

// ─── Find the admin user to assign as author ──────────────────────────────────
async function getAdminUserId() {
    try {
        const [users] = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        return users.length ? users[0].id : 1;
    } catch {
        return 1;
    }
}

// ─── Save generated blog as a draft ──────────────────────────────────────────
async function saveDraftPost(blogData, authorId, categoryId) {
    try {
        let slug = slugify(blogData.title, { lower: true, strict: true });

        // Ensure unique slug
        const [existing] = await pool.query('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing.length) {
            slug = `${slug}-${Date.now()}`;
        }

        const [result] = await pool.query(
            `INSERT INTO posts 
             (title, slug, content, category_id, author_id, meta_title, meta_description, status, view_count) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', 0)`,
            [
                blogData.title,
                slug,
                blogData.content,
                categoryId,
                authorId,
                blogData.meta_title || blogData.title.substring(0, 60),
                blogData.meta_description || '',
            ]
        );

        console.log(`[AI Blogger] ✅ Draft saved: "${blogData.title}" (ID: ${result.insertId})`);
        return result.insertId;
    } catch (error) {
        console.error('[AI Blogger] Failed to save draft:', error.message);
        return null;
    }
}

// ─── Main orchestrator: run the full AI blog generation pipeline ──────────────
async function runAIBlogger(postsToGenerate = 2) {
    console.log(`[AI Blogger] 🚀 Starting — generating ${postsToGenerate} blog drafts...`);

    const news = await fetchTopNews(postsToGenerate);
    if (!news.length) {
        console.log('[AI Blogger] ⚠️  No news fetched. Skipping.');
        return { success: false, generated: 0 };
    }

    const authorId = await getAdminUserId();
    let generatedCount = 0;

    for (const article of news) {
        console.log(`[AI Blogger] 📰 Processing: "${article.title}"`);

        const blogData = await generateBlogFromNews(article);
        if (!blogData) {
            console.log('[AI Blogger] ⚠️  Skipping article — generation failed.');
            continue;
        }

        const categoryId = await getOrCreateCategory(
            blogData.category_suggestion || 'World'
        );

        const postId = await saveDraftPost(blogData, authorId, categoryId);
        if (postId) generatedCount++;

        // Small delay between Gemini calls to avoid rate limiting
        if (news.indexOf(article) < news.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    console.log(`[AI Blogger] 🎉 Done — ${generatedCount} draft(s) created.`);
    return { success: true, generated: generatedCount };
}

module.exports = { runAIBlogger };
