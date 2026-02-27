const pool = require('../config/db');

// @desc    Get global stats for admin dashboard
// @route   GET /api/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
    try {
        // Total Posts & Total Blog Views
        const [posts] = await pool.query("SELECT COUNT(*) as count, COALESCE(SUM(view_count), 0) as views FROM posts");

        // Total Comments
        const [comments] = await pool.query("SELECT COUNT(*) as count FROM comments");

        // Total Site Visits
        const [siteStats] = await pool.query("SELECT total_visits FROM site_stats WHERE id = 1");

        // Average Rating & Total Ratings
        const [ratings] = await pool.query("SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as avgRating FROM ratings");

        // Unique Visitors safely
        let uniqueCount = 0;
        try {
            const [uniqueVisitors] = await pool.query("SELECT COUNT(*) as count FROM unique_visitors");
            uniqueCount = uniqueVisitors[0].count || 0;
        } catch (e) {
            // Table might not exist yet, let's create it for convenience on cloud deployments
            try {
                await pool.query(`CREATE TABLE IF NOT EXISTS unique_visitors (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    ip_address VARCHAR(50) UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`);
                const [uniqueVisitors] = await pool.query("SELECT COUNT(*) as count FROM unique_visitors");
                uniqueCount = uniqueVisitors[0].count || 0;
            } catch (createErr) {
                console.error("Failed to create unique_visitors table:", createErr);
            }
        }

        const totalVisitsCount = siteStats[0]?.total_visits || 0;

        // Calculate Repeated Views
        const repeatViews = Math.max(0, totalVisitsCount - uniqueCount);

        res.json({
            totalPosts: posts[0].count || 0,
            totalBlogViews: posts[0].views || 0,
            totalComments: comments[0].count || 0,
            totalSiteVisits: totalVisitsCount,
            uniqueVisitors: uniqueCount,
            repeatViews: repeatViews,
            averageRating: parseFloat(ratings[0].avgRating).toFixed(1),
            totalRatings: ratings[0].count || 0
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Track a new site visit
// @route   POST /api/stats/visit
// @access  Public
const trackVisit = async (req, res, next) => {
    try {
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

        // Bump total visits strictly
        await pool.query("UPDATE site_stats SET total_visits = total_visits + 1 WHERE id = 1");

        // Attempt to log unique visitor (Ignore error if duplicate ip)
        if (clientIp) {
            try {
                await pool.query("INSERT IGNORE INTO unique_visitors (ip_address) VALUES (?)", [clientIp]);
            } catch (err) { }
        }

        res.status(200).json({ message: 'Visit tracked' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminStats,
    trackVisit
};
