const express = require('express');
const router = express.Router();
const {
    getPosts,
    getAdminPosts,
    getPostBySlug,
    getPostById,
    createPost,
    updatePost,
    deletePost,
} = require('../controllers/postController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { ratePost } = require('../controllers/ratingController');

router.route('/').get(getPosts).post(protect, admin, createPost);
router.route('/admin').get(protect, admin, getAdminPosts);
router.route('/admin/:id').get(protect, admin, getPostById);
router.route('/:id/rate').post(ratePost);

// Let's get by ID or slug. Note /:id/rate should be defined before /:slug so it doesn't try to parse 'id' as 'slug'
router.route('/:slug').get(getPostBySlug);
// use id for update/delete as slug might change
router.route('/:id').put(protect, admin, updatePost).delete(protect, admin, deletePost);

module.exports = router;
