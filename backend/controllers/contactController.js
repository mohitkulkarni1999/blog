const pool = require('../config/db');

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
const getMessages = async (req, res) => {
    try {
        const [messages] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const submitMessage = async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'All fields are required' });

    try {
        const [result] = await pool.query(
            'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );

        res.status(201).json({ id: result.insertId, message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMessages,
    submitMessage,
};
