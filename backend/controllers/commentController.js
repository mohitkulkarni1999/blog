const pool = require('../config/db');

// @desc    Get comments by post ID
// @route   GET /api/comments/:postId
// @access  Public
const getCommentsByPost = async (req, res) => {
    try {
        const [comments] = await pool.query(
            'SELECT c.*, COALESCE(u.name, c.guest_name, "Anonymous") as user_name FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.post_id = ? AND c.status = "approved" ORDER BY c.created_at DESC',
            [req.params.postId]
        );
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all comments (Admin)
// @route   GET /api/comments
// @access  Private/Admin
const getAllComments = async (req, res) => {
    try {
        const [comments] = await pool.query(
            'SELECT c.*, COALESCE(u.name, c.guest_name, "Anonymous") as user_name, p.title as post_title FROM comments c LEFT JOIN users u ON c.user_id = u.id LEFT JOIN posts p ON c.post_id = p.id ORDER BY c.created_at DESC'
        );
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
    const { post_id, comment, guest_name } = req.body;
    if (!comment || !post_id) return res.status(400).json({ message: 'Comment and post_id are required' });

    try {
        const userId = req.user ? req.user.id : null;
        const gName = userId ? null : (guest_name || 'Anonymous');

        const [result] = await pool.query(
            'INSERT INTO comments (post_id, user_id, guest_name, comment, status) VALUES (?, ?, ?, ?, "approved")',
            [post_id, userId, gName, comment]
        );

        res.status(201).json({ id: result.insertId, message: 'Comment submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update comment status (Approve)
// @route   PUT /api/comments/:id
// @access  Private/Admin
const updateCommentStatus = async (req, res) => {
    const { status } = req.body;

    try {
        await pool.query('UPDATE comments SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Comment status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private/Admin
const deleteComment = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json({ message: 'Comment removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getCommentsByPost,
    getAllComments,
    createComment,
    updateCommentStatus,
    deleteComment,
};
