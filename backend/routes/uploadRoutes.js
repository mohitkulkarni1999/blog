const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect, admin } = require('../middlewares/authMiddleware');

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfsjmvcew',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blog_images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    },
});

const upload = multer({ storage });

// Single Image Upload
router.post('/', protect, admin, upload.single('image'), (req, res) => {
    if (req.file) {
        res.send({
            message: 'Image uploaded to Cloudinary',
            image: req.file.path // This returns the full URL
        });
    } else {
        res.status(400).send({ message: 'No image uploaded' });
    }
});

// Multiple Images Upload
router.post('/multiple', protect, admin, upload.array('images', 10), (req, res) => {
    if (req.files && req.files.length > 0) {
        const paths = req.files.map(file => file.path); // Full URLs
        res.send({
            message: 'Images uploaded to Cloudinary',
            images: paths
        });
    } else {
        res.status(400).send({ message: 'No images uploaded' });
    }
});

module.exports = router;
