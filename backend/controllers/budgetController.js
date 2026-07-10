const pool = require('../config/db');

// @desc    Get all budgets for a user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
    try {
        const [budgets] = await pool.execute(`
            SELECT b.*, c.name as category_name 
            FROM budgets b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.user_id = ?
        `, [req.user.id]);
        res.json(budgets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Set or update a budget
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res) => {
    const { category_id, amount, month, year } = req.body;

    if (!category_id || !amount || !month || !year) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        // Check if budget exists for this category and month/year
        const [existing] = await pool.execute(
            'SELECT * FROM budgets WHERE user_id = ? AND category_id = ? AND month = ? AND year = ?',
            [req.user.id, category_id, month, year]
        );

        if (existing.length > 0) {
            // Update
            await pool.execute(
                'UPDATE budgets SET amount = ? WHERE id = ?',
                [amount, existing[0].id]
            );
            return res.json({ id: existing[0].id, category_id, amount, month, year });
        } else {
            // Create
            const [result] = await pool.execute(
                'INSERT INTO budgets (user_id, category_id, amount, month, year) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, category_id, amount, month, year]
            );
            return res.status(201).json({ id: result.insertId, category_id, amount, month, year });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
    const { id } = req.params;

    try {
        const [budgets] = await pool.execute(
            'SELECT * FROM budgets WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        
        if (budgets.length === 0) {
            return res.status(404).json({ message: 'Budget not found or unauthorized' });
        }

        await pool.execute('DELETE FROM budgets WHERE id = ?', [id]);
        res.json({ id: parseInt(id) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getBudgets, setBudget, deleteBudget };
