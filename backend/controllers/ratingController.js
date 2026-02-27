const pool = require('../config/db');

// @desc    Rate a post
// @route   POST /api/posts/:postId/rate
// @access  Public
const ratePost = async (req, res, next) => {
    const { rating } = req.body;
    const postId = req.params.id; // Corrected from postId to id to match route

    // Use user id if logged in, else use IP for tracking
    const userId = req.user ? req.user.id : null;
    const guestIp = userId ? null : (req.ip || req.connection.remoteAddress || 'unknown-ip');

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    try {
        // Check if post exists
        const [posts] = await pool.query('SELECT id FROM posts WHERE id = ?', [postId]);
        if (posts.length === 0) return res.status(404).json({ message: 'Post not found' });

        // Insert or update rating based on whether it is a user or guest
        if (userId) {
            await pool.query(
                `INSERT INTO ratings (post_id, user_id, rating) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
                [postId, userId, rating]
            );
        } else {
            await pool.query(
                `INSERT INTO ratings (post_id, guest_ip, rating) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
                [postId, guestIp, rating]
            );
        }

        // Calculate new average
        const [avgResult] = await pool.query(
            'SELECT AVG(rating) as averageRating, COUNT(*) as totalRatings FROM ratings WHERE post_id = ?',
            [postId]
        );

        res.json({
            message: 'Rating submitted successfully',
            averageRating: parseFloat(avgResult[0].averageRating).toFixed(1),
            totalRatings: avgResult[0].totalRatings
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    ratePost
};
