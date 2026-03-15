const cron = require('node-cron');
const { runAIBlogger } = require('../services/aiBlogger');

// ─── Schedule: Run every day at 8:00 AM (IST = UTC+5:30 = 2:30 AM UTC) ───────
// Cron format: second minute hour day-of-month month day-of-week
// '30 2 * * *'  = 2:30 AM UTC = 8:00 AM IST
const CRON_SCHEDULE = process.env.AI_BLOGGER_CRON || '0 */6 * * *';
const POSTS_PER_RUN = parseInt(process.env.AI_BLOGGER_POSTS || '2', 10);

function startAIBloggerScheduler() {
    if (!process.env.GEMINI_API_KEY || !process.env.NEWS_API_KEY) {
        console.log('[Scheduler] ⚠️  GEMINI_API_KEY or NEWS_API_KEY not set — AI Blogger disabled.');
        return;
    }

    console.log(`[Scheduler] 🤖 AI Blogger scheduled — ${POSTS_PER_RUN} news signals/run at cron: "${CRON_SCHEDULE}"`);

    cron.schedule(CRON_SCHEDULE, async () => {
        console.log('[Scheduler] ⏰ AI Blogger cron triggered...');
        try {
            await runAIBlogger(POSTS_PER_RUN);
        } catch (err) {
            console.error('[Scheduler] ❌ AI Blogger cron error:', err.message);
        }
    }, {
        timezone: 'UTC'
    });
}

module.exports = { startAIBloggerScheduler };
