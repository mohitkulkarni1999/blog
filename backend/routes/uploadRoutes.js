const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '../../frontend/blogimages'));
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

router.post('/', protect, admin, upload.single('image'), (req, res) => {
    if (req.file) {
        res.send({
            message: 'Image uploaded',
            image: `/blogimages/${req.file.filename}`
        });
    } else {
        res.status(400).send({ message: 'No image uploaded' });
    }
});

router.post('/multiple', protect, admin, upload.array('images', 10), (req, res) => {
    if (req.files && req.files.length > 0) {
        const paths = req.files.map(file => `/blogimages/${file.filename}`);
        res.send({
            message: 'Images uploaded',
            images: paths
        });
    } else {
        res.status(400).send({ message: 'No images uploaded' });
    }
});

module.exports = router;
