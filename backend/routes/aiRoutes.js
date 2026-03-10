const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { runAIBlogger } = require('../services/aiBlogger');

// @desc    Manually trigger AI blog generation
// @route   POST /api/ai/generate
// @access  Private/Admin
router.post('/generate', protect, admin, async (req, res) => {
    try {
        const count = parseInt(req.body.count) || 2;
        if (count < 1 || count > 10) {
            return res.status(400).json({ message: 'Count must be between 1 and 10' });
        }

        // Run in background — respond immediately so request doesn't time out
        res.json({ message: `AI Blogger started. Generating ${count} blog draft(s)...`, count });

        // Run after response sent
        setImmediate(async () => {
            try {
                await runAIBlogger(count);
            } catch (err) {
                console.error('[AI Route] Background generation error:', err.message);
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to trigger AI blogger', error: error.message });
    }
});

// @desc    Get AI blogger status / config info
// @route   GET /api/ai/status
// @access  Public (safe — no sensitive data exposed)
router.get('/status', (req, res) => {
    res.json({
        enabled: !!(process.env.GEMINI_API_KEY && process.env.NEWS_API_KEY),
        postsPerDay: parseInt(process.env.AI_BLOGGER_POSTS || '2', 10),
        schedule: process.env.AI_BLOGGER_CRON || '30 2 * * *',
        scheduledTime: '8:00 AM IST daily',
        model: 'gemini-2.0-flash',
    });
});

module.exports = router;
