require('dotenv').config();
const pool = require('./config/db');

async function check() {
    try {
        const [rows] = await pool.query('SELECT title, slug, status FROM posts ORDER BY created_at DESC LIMIT 20');
        console.log('Recent posts:', rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
