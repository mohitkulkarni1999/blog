const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/statController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/').get(protect, admin, getAdminStats);

module.exports = router;
