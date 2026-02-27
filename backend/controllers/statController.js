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

        res.json({
            totalPosts: posts[0].count || 0,
            totalBlogViews: posts[0].views || 0,
            totalComments: comments[0].count || 0,
            totalSiteVisits: siteStats[0]?.total_visits || 0,
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
        await pool.query("UPDATE site_stats SET total_visits = total_visits + 1 WHERE id = 1");
        res.status(200).json({ message: 'Visit tracked' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminStats,
    trackVisit
};
