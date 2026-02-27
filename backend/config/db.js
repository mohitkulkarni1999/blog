const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// If DATABASE_URL is present, we use it directly as the connection string.
// MySQL2 createPool can take a connection string as the first argument.
const pool = process.env.DATABASE_URL
    ? mysql.createPool(process.env.DATABASE_URL)
    : mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'blog_db',
        port: process.env.DB_PORT || 3306,
        ssl: {
            rejectUnauthorized: false
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

module.exports = pool;
