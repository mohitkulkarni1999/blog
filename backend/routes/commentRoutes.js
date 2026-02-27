const express = require('express');
const router = express.Router();
const {
    getCommentsByPost,
    getAllComments,
    createComment,
    updateCommentStatus,
    deleteComment,
} = require('../controllers/commentController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/').get(protect, admin, getAllComments).post(createComment);
router.route('/post/:postId').get(getCommentsByPost);
router.route('/:id').put(protect, admin, updateCommentStatus).delete(protect, admin, deleteComment);


module.exports = router;
