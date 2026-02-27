const pool = require('../config/db');
const slugify = require('slugify');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    try {
        let slug = slugify(name, { lower: true, strict: true });

        const [existing] = await pool.query('SELECT id FROM categories WHERE slug = ?', [slug]);
        if (existing.length) {
            slug = `${slug}-${Date.now()}`;
        }

        const [result] = await pool.query(
            'INSERT INTO categories (name, slug) VALUES (?, ?)',
            [name, slug]
        );

        res.status(201).json({ id: result.insertId, name, slug });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getCategories,
    createCategory,
    deleteCategory,
};
