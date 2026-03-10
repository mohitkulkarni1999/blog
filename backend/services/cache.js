const { Redis } = require('@upstash/redis');

let redis = null;
let cacheEnabled = false;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        cacheEnabled = true;
        console.log('[Cache] ✅ Upstash Redis connected — caching enabled');
    } catch (err) {
        console.warn('[Cache] Redis setup failed:', err.message);
    }
} else {
    console.log('[Cache] ℹ️  UPSTASH_REDIS_REST_URL not set — caching disabled (app works normally)');
}

// ─── Cache Get ────────────────────────────────────────────────────────────────
async function cacheGet(key) {
    if (!cacheEnabled || !redis) return null;
    try {
        return await redis.get(key); // @upstash/redis auto-parses JSON
    } catch {
        return null;
    }
}

// ─── Cache Set ────────────────────────────────────────────────────────────────
async function cacheSet(key, value, ttlSeconds = 300) {
    if (!cacheEnabled || !redis) return;
    try {
        await redis.set(key, value, { ex: ttlSeconds });
    } catch {
        // Silently ignore — cache is optional
    }
}

// ─── Cache Delete by Pattern ──────────────────────────────────────────────────
async function cacheDel(pattern) {
    if (!cacheEnabled || !redis) return;
    try {
        // Use SCAN to find matching keys (safe for production)
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`[Cache] 🗑️  Invalidated ${keys.length} key(s): ${pattern}`);
        }
    } catch {
        // Silently ignore
    }
}

module.exports = { cacheGet, cacheSet, cacheDel };
