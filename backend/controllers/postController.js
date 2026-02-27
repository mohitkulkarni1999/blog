const pool = require('../config/db');
const slugify = require('slugify');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search ? `%${req.query.search}%` : null;
        const categoryId = req.query.category || null;

        let query = `
            SELECT 
                p.id, p.title, p.slug, p.featured_image, p.category_id, 
                p.author_id, p.created_at, p.view_count, p.meta_description, 
                p.status, c.name as category_name, u.name as author_name 
            FROM posts p 
            LEFT JOIN categories c ON p.category_id = c.id 
            LEFT JOIN users u ON p.author_id = u.id 
            WHERE p.status = 'published'
        `;
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM posts p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.status = 'published'
        `;

        const queryParams = [];
        const countParams = [];

        if (search) {
            query += " AND (p.title LIKE ? OR p.content LIKE ? OR c.name LIKE ?)";
            countQuery += " AND (p.title LIKE ? OR p.content LIKE ? OR c.name LIKE ?)";
            queryParams.push(search, search, search);
            countParams.push(search, search, search);
        }

        if (categoryId) {
            query += " AND p.category_id = ?";
            countQuery += " AND p.category_id = ?";
            queryParams.push(categoryId);
            countParams.push(categoryId);
        }

        query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
        queryParams.push(limit, offset);

        const [posts] = await pool.query(query, queryParams);
        const [totalRows] = await pool.query(countQuery, countParams);

        res.json({
            posts,
            total: totalRows[0].total,
            page,
            pages: Math.ceil(totalRows[0].total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all posts for admin (includes drafts)
// @route   GET /api/posts/admin
// @access  Private/Admin
const getAdminPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const query = `
            SELECT 
                p.*, 
                c.name as category_name, 
                u.name as author_name,
                COALESCE((SELECT AVG(rating) FROM ratings WHERE post_id = p.id), 0) as avg_rating,
                COALESCE((SELECT COUNT(*) FROM ratings WHERE post_id = p.id), 0) as rating_count
            FROM posts p 
            LEFT JOIN categories c ON p.category_id = c.id 
            LEFT JOIN users u ON p.author_id = u.id 
            ORDER BY p.created_at DESC 
            LIMIT ? OFFSET ?
        `;
        const countQuery = 'SELECT COUNT(*) as total FROM posts';

        const [posts] = await pool.query(query, [limit, offset]);
        const [totalRows] = await pool.query(countQuery);

        res.json({
            posts: posts.map(p => ({
                ...p,
                avg_rating: parseFloat(p.avg_rating).toFixed(1)
            })),
            total: totalRows[0].total,
            page,
            pages: Math.ceil(totalRows[0].total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
// @access  Public
const getPostBySlug = async (req, res) => {
    try {
        const [posts] = await pool.query(
            `SELECT p.*, c.name as category_name, u.name as author_name,
             COALESCE((SELECT AVG(rating) FROM ratings WHERE post_id = p.id), 0) as averageRating,
             COALESCE((SELECT COUNT(*) FROM ratings WHERE post_id = p.id), 0) as totalRatings
             FROM posts p 
             LEFT JOIN categories c ON p.category_id = c.id 
             LEFT JOIN users u ON p.author_id = u.id 
             WHERE p.slug = ?`,
            [req.params.slug]
        );

        if (posts.length) {
            const post = posts[0];

            // Run these in parallel to reduce wait time
            const [imagesQueryRes, commentsQueryRes] = await Promise.all([
                pool.query('SELECT image_url FROM post_images WHERE post_id = ?', [post.id]),
                pool.query('SELECT * FROM comments WHERE post_id = ? AND status = "approved" ORDER BY created_at DESC', [post.id]),
                pool.query('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [post.id])
            ]);

            post.view_count += 1;
            post.averageRating = parseFloat(post.averageRating).toFixed(1);
            post.additional_images = imagesQueryRes[0].map(img => img.image_url);
            post.comments = commentsQueryRes[0];

            res.json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private/Admin
const createPost = async (req, res) => {
    const { title, content, featured_image, category_id, meta_title, meta_description, status } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
        let slug = slugify(title, { lower: true, strict: true });
        // check uniqueness
        const [existing] = await pool.query('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing.length) {
            slug = `${slug}-${Date.now()}`;
        }

        const [result] = await pool.query(
            'INSERT INTO posts (title, slug, content, featured_image, category_id, author_id, meta_title, meta_description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, slug, content, featured_image, category_id, req.user.id, meta_title, meta_description, status || 'draft']
        );

        const postId = result.insertId;

        // Insert additional images if any
        const { additional_images } = req.body;
        if (additional_images && Array.isArray(additional_images)) {
            for (const imgUrl of additional_images) {
                await pool.query('INSERT INTO post_images (post_id, image_url) VALUES (?, ?)', [postId, imgUrl]);
            }
        }

        res.status(201).json({ id: postId, title, slug, status });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private/Admin
const updatePost = async (req, res) => {
    const { title, content, featured_image, category_id, meta_title, meta_description, status } = req.body;

    try {
        const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);

        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        let slug = posts[0].slug;
        if (title && title !== posts[0].title) {
            slug = slugify(title, { lower: true, strict: true });
            const [existing] = await pool.query('SELECT id FROM posts WHERE slug = ? AND id != ?', [slug, req.params.id]);
            if (existing.length) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        await pool.query(
            'UPDATE posts SET title=?, slug=?, content=?, featured_image=?, category_id=?, meta_title=?, meta_description=?, status=? WHERE id=?',
            [
                title || posts[0].title,
                slug,
                content || posts[0].content,
                featured_image || posts[0].featured_image,
                category_id || posts[0].category_id,
                meta_title || posts[0].meta_title,
                meta_description || posts[0].meta_description,
                status || posts[0].status,
                req.params.id
            ]
        );

        // Update additional images
        const { additional_images } = req.body;
        if (additional_images && Array.isArray(additional_images)) {
            // Simple approach: delete all and re-insert
            await pool.query('DELETE FROM post_images WHERE post_id = ?', [req.params.id]);
            for (const imgUrl of additional_images) {
                await pool.query('INSERT INTO post_images (post_id, image_url) VALUES (?, ?)', [req.params.id, imgUrl]);
            }
        }

        res.json({ message: 'Post updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private/Admin
const deletePost = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getPostById = async (req, res) => {
    try {
        const [posts] = await pool.query(
            'SELECT p.*, c.name as category_name FROM posts p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
            [req.params.id]
        );

        if (posts.length) {
            const post = posts[0];
            const [imagesRes] = await pool.query('SELECT image_url FROM post_images WHERE post_id = ?', [post.id]);
            post.additional_images = imagesRes.map(img => img.image_url);
            res.json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getPosts,
    getAdminPosts,
    getPostBySlug,
    getPostById,
    createPost,
    updatePost,
    deletePost,
};
