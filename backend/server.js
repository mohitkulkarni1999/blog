const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const pool = require('./config/db');
const path = require('path');

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin image requests
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps)
        if (!origin) return callback(null, true);

        const isLocalhost = origin.includes('localhost');
        const isVercel = origin.includes('vercel.app');
        const isCustom = process.env.CLIENT_URL && origin === process.env.CLIENT_URL;

        if (isLocalhost || isVercel || isCustom || !process.env.CLIENT_URL) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Built-in Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use('/blogimages', express.static(path.join(__dirname, '../frontend/blogimages')));

// Test Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/stats', require('./routes/statRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Error Handling Middleware
app.use(require('./middlewares/errorMiddleware'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database!');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
});
