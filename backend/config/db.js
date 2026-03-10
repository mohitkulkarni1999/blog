const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const poolConfig = process.env.DATABASE_URL
    ? {
        uri: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'blog_db',
        port: process.env.DB_PORT || 3306,
        ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? {
            rejectUnauthorized: false
        } : null
    };

const pool = mysql.createPool({
    ...poolConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,        // Keep TCP connections alive
    keepAliveInitialDelay: 10000  // Start keep-alive after 10 seconds
});

// ─── Keep-Alive Ping ──────────────────────────────────────────────────────────
// Aiven free tier shuts down after 24h of inactivity.
// We ping every 4 hours to prevent that from happening.
const PING_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

const keepAlive = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('[DB] Keep-alive ping successful');
    } catch (err) {
        console.error('[DB] Keep-alive ping failed:', err.message);
    }
};

// Only start keep-alive when deployed (not in local dev, to avoid noise)
if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
    setInterval(keepAlive, PING_INTERVAL_MS);
    console.log('[DB] Keep-alive ping scheduled every 4 hours');
}
// ─────────────────────────────────────────────────────────────────────────────

module.exports = pool;
