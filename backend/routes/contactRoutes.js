const express = require('express');
const router = express.Router();
const { getMessages, submitMessage } = require('../controllers/contactController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/').get(protect, admin, getMessages).post(submitMessage);

module.exports = router;
