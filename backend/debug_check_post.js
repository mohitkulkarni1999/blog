require('dotenv').config();
const pool = require('./config/db');

async function check() {
    try {
        const [rows] = await pool.query('SELECT title, slug, status FROM posts WHERE slug LIKE ?', ['%judges-order%']);
        console.log('Results:', rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
