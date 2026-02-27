const pool = require('../config/db');

// @desc    Get global stats for admin dashboard
// @route   GET /api/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const [posts] = await pool.query('SELECT COUNT(*) as count, SUM(view_count) as views FROM posts');
        const [comments] = await pool.query('SELECT COUNT(*) as count FROM comments');

        res.json({
            totalPosts: posts[0].count || 0,
            totalViews: posts[0].views || 0,
            totalComments: comments[0].count || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getAdminStats
};
