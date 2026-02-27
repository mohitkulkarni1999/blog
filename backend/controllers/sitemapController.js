const pool = require('../config/db');

// @desc    Generate dynamic sitemap.xml
// @route   GET /sitemap.xml
// @access  Public
const getSitemap = async (req, res, next) => {
    try {
        const baseUrl = 'https://dailyupdateshub.in';

        // Fetch all published posts
        const [posts] = await pool.query("SELECT slug, updated_at FROM posts WHERE status = 'published' ORDER BY updated_at DESC");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/about</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
    <url>
        <loc>${baseUrl}/contact</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>
    ${posts.map(post => `
    <url>
        <loc>${baseUrl}/blog/${post.slug}</loc>
        <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.status(200).send(xml);
    } catch (error) {
        next(error);
    }
};

module.exports = { getSitemap };
