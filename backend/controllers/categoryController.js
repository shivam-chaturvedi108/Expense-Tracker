const pool = require('../config/db');

// @desc    Get all categories for a user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.execute(
            'SELECT * FROM categories WHERE user_id = ? ORDER BY type, name',
            [req.user.id]
        );
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
    const { name, type } = req.body;

    if (!name || !type) {
        return res.status(400).json({ message: 'Please provide name and type' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
            [req.user.id, name, type]
        );
        
        const newCategory = {
            id: result.insertId,
            user_id: req.user.id,
            name,
            type
        };
        
        res.status(201).json(newCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        // Ensure category belongs to user
        const [categories] = await pool.execute(
            'SELECT * FROM categories WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        
        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found or unauthorized' });
        }

        await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ id: parseInt(id) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getCategories, createCategory, deleteCategory };
