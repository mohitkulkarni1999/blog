const pool = require('./config/db');

async function addIndexes() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log("Checking and adding indexes...");

        // Posts indexes
        const postsIndexes = [
            { name: 'idx_posts_status', table: 'posts', columns: 'status' },
            { name: 'idx_posts_slug', table: 'posts', columns: 'slug' },
            { name: 'idx_posts_category', table: 'posts', columns: 'category_id' },
            { name: 'idx_posts_created', table: 'posts', columns: 'created_at' }
        ];

        for (const idx of postsIndexes) {
            try {
                const [existing] = await connection.query(`SHOW INDEX FROM ${idx.table} WHERE Key_name = ?`, [idx.name]);
                if (existing.length === 0) {
                    console.log(`Adding index ${idx.name}...`);
                    if (idx.name === 'idx_posts_slug') {
                        await connection.query(`ALTER TABLE ${idx.table} ADD UNIQUE INDEX ${idx.name} (${idx.columns})`);
                    } else {
                        await connection.query(`ALTER TABLE ${idx.table} ADD INDEX ${idx.name} (${idx.columns})`);
                    }
                }
            } catch (err) {
                console.error(`Error adding index ${idx.name}:`, err.message);
            }
        }

        // Additional table indexes
        const otherIndexes = [
            { name: 'idx_comments_post', table: 'comments', columns: 'post_id' },
            { name: 'idx_comments_status', table: 'comments', columns: 'status' },
            { name: 'idx_ratings_post', table: 'ratings', columns: 'post_id' },
            { name: 'idx_images_post', table: 'post_images', columns: 'post_id' }
        ];

        for (const idx of otherIndexes) {
            try {
                const [existing] = await connection.query(`SHOW INDEX FROM ${idx.table} WHERE Key_name = ?`, [idx.name]);
                if (existing.length === 0) {
                    console.log(`Adding index ${idx.name}...`);
                    await connection.query(`ALTER TABLE ${idx.table} ADD INDEX ${idx.name} (${idx.columns})`);
                }
            } catch (err) {
                console.error(`Error adding index ${idx.name}:`, err.message);
            }
        }

        console.log("Database indexing check complete.");
    } catch (error) {
        console.error("Critical error adding indexes:", error.message);
    } finally {
        if (connection) connection.release();
        process.exit();
    }
}

addIndexes();
