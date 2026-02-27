const pool = require('../config/db');

// @desc    Get global stats for admin dashboard
// @route   GET /api/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
    try {
        const [posts] = await pool.query("SELECT COUNT(*) as count, COALESCE(SUM(view_count), 0) as views FROM posts");
        const [comments] = await pool.query("SELECT COUNT(*) as count FROM comments");

        res.json({
            totalPosts: posts[0].count || 0,
            totalViews: posts[0].views || 0,
            totalComments: comments[0].count || 0
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminStats
};
