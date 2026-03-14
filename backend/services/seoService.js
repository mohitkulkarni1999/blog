const axios = require('axios');

const pingSearchEngines = async (slug) => {
    const sitemapUrl = `https://dailyupdateshub.in/sitemap.xml`;
    const postUrl = `https://dailyupdateshub.in/blog/${slug}`;

    try {
        // Ping Google
        await axios.get(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`).catch(() => {});
        
        // Bing / Yahoo
        await axios.get(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`).catch(() => {});

        console.log(`[SEO] Pinged search engines for: ${postUrl}`);
    } catch (error) {
        console.error('[SEO] Failed to ping search engines', error.message);
    }
};

module.exports = { pingSearchEngines };
