const pool = require('./config/db');

async function updateSchema() {
    let connection;
    try {
        connection = await pool.getConnection();

        console.log("Dropping foreign keys and altering tables...");

        // Comments table auth changes
        const [commentConstraints] = await connection.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'blog_db' 
      AND TABLE_NAME = 'comments' AND COLUMN_NAME = 'user_id'
    `);

        if (commentConstraints.length && commentConstraints[0].CONSTRAINT_NAME) {
            await connection.query(`ALTER TABLE comments DROP FOREIGN KEY ${commentConstraints[0].CONSTRAINT_NAME}`);
        }

        await connection.query(`ALTER TABLE comments MODIFY COLUMN user_id INT NULL`);
        try {
            await connection.query(`ALTER TABLE comments ADD COLUMN guest_name VARCHAR(100) NULL AFTER user_id`);
        } catch (e) { } // ignore if exists

        // Ratings table auth changes
        const [ratingConstraints] = await connection.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'blog_db' 
      AND TABLE_NAME = 'ratings' AND COLUMN_NAME = 'user_id'
      AND CONSTRAINT_NAME != 'PRIMARY'
    `);

        if (ratingConstraints.length && ratingConstraints[0].CONSTRAINT_NAME) {
            // filter out 'user_post' unique key here, only want foreign
            const fk = ratingConstraints.find(c => c.CONSTRAINT_NAME.includes('ibfk'));
            if (fk) {
                await connection.query(`ALTER TABLE ratings DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
            }
        }

        await connection.query(`ALTER TABLE ratings MODIFY COLUMN user_id INT NULL`);
        try {
            await connection.query(`ALTER TABLE ratings ADD COLUMN guest_ip VARCHAR(50) NULL AFTER user_id`);
        } catch (e) { } // ignore if exists

        try {
            await connection.query(`ALTER TABLE ratings DROP INDEX user_post`);
        } catch (e) { } // ignore if not exist

        try {
            await connection.query(`ALTER TABLE ratings ADD UNIQUE KEY ip_post (guest_ip, post_id)`);
        } catch (e) { } // ignore if exists

        // Create post_images table if not exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS post_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
            )
        `);

        console.log('Schema updated successfully for anonymous use and multiple images');
    } catch (error) {
        console.error('Error updating schema', error);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

updateSchema();
