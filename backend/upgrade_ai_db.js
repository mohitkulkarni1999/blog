const pool = require('./config/db');

async function upgradeDB() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('[DB] Upgrading posts table...');
        
        // Add featured_image_prompt
        try {
            await connection.query(`ALTER TABLE posts ADD COLUMN featured_image_prompt TEXT NULL AFTER featured_image`);
            console.log('[DB] Added featured_image_prompt');
        } catch (e) { console.log('[DB] featured_image_prompt already exists'); }

        // Add reading_time
        try {
            await connection.query(`ALTER TABLE posts ADD COLUMN reading_time INT NULL AFTER featured_image_prompt`);
            console.log('[DB] Added reading_time');
        } catch (e) { console.log('[DB] reading_time already exists'); }

        console.log('[DB] Database upgrade complete.');
    } catch (err) {
        console.error('[DB] Upgrade failed:', err.message);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

upgradeDB();
