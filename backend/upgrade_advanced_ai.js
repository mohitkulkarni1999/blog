const pool = require('./config/db');

async function upgradeDB() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('[DB] Upgrading schema for advanced AI features...');
        
        // 1. Add focus_keywords and topic_cluster to posts
        try {
            await connection.query(`ALTER TABLE posts ADD COLUMN focus_keywords TEXT NULL AFTER meta_description`);
            console.log('[DB] Added focus_keywords');
        } catch (e) { console.log('[DB] focus_keywords already exists'); }

        try {
            await connection.query(`ALTER TABLE posts ADD COLUMN topic_cluster VARCHAR(100) NULL AFTER category_id`);
            console.log('[DB] Added topic_cluster');
        } catch (e) { console.log('[DB] topic_cluster already exists'); }

        // 2. Create tags table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tags (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL
            )
        `);
        console.log('[DB] Tags table ready');

        // 3. Create post_tags junction table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS post_tags (
                post_id INT NOT NULL,
                tag_id INT NOT NULL,
                PRIMARY KEY (post_id, tag_id),
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            )
        `);
        console.log('[DB] Post_tags junction table ready');

        console.log('[DB] Advanced Database upgrade complete.');
    } catch (err) {
        console.error('[DB] Upgrade failed:', err.message);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

upgradeDB();
