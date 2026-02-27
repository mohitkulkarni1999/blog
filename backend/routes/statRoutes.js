const express = require('express');
const router = express.Router();
const { getAdminStats, trackVisit } = require('../controllers/statController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/').get(protect, admin, getAdminStats);
router.route('/visit').post(trackVisit);

module.exports = router;
