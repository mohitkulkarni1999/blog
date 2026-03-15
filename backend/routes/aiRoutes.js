const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect, admin } = require('../middlewares/authMiddleware');
const { runAIBlogger, getBloggerStatus } = require('../services/aiBlogger');

// @desc    List available Gemini models for the current API key (diagnostic)
// @route   GET /api/ai/models
// @access  Public
router.get('/models', async (req, res) => {
    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
            { timeout: 10000 }
        );
        const models = response.data.models?.map(m => m.name) || [];
        res.json({ total: models.length, models });
    } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.error?.message || err.message;
        res.status(status || 500).json({ error: msg, hint: status === 400 ? 'API key is invalid or expired' : 'Check API key and project settings' });
    }
});

// @desc    Manually trigger AI blog generation
// @route   POST /api/ai/generate
// @access  Private/Admin
router.post('/generate', protect, admin, async (req, res) => {
    const status = getBloggerStatus();
    if (status.isProcessing) {
        return res.status(423).json({ 
            message: 'AI Blogger is already busy.', 
            progress: status.progress,
            uptime: `${status.uptime}s`
        });
    }

    try {
        const count = parseInt(req.body.count) || 5;
        if (count < 1 || count > 10) {
            return res.status(400).json({ message: 'Count must be between 1 and 10' });
        }

        res.json({ message: `AI Blogger started in Turbo Mode. Creating your masterpiece...`, progress: 'Initializing...' });

        setImmediate(async () => {
            try {
                await runAIBlogger(count, true); // true = Fast Manual Mode
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
// @access  Public
router.get('/status', (req, res) => {
    const status = getBloggerStatus();
    res.json({
        enabled: !!(process.env.GEMINI_API_KEY && process.env.NEWS_API_KEY),
        postsPerRun: parseInt(process.env.AI_BLOGGER_POSTS || '5', 10),
        schedule: process.env.AI_BLOGGER_CRON || '0 */3 * * *',
        currentModel: 'gemini-2.5-flash (Verified)',
        isProcessing: status.isProcessing,
        currentProgress: status.progress,
        uptime: status.uptime
    });
});

module.exports = router;
