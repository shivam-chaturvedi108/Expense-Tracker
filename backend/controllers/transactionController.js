const pool = require('../config/db');

// Helper to format transactions
const formatTransaction = (tx) => ({
    ...tx,
    amount: parseFloat(tx.amount)
});

// @desc    Get all transactions (income + expense)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const [incomes] = await pool.execute(`
            SELECT i.*, c.name as category_name, 'income' as type 
            FROM income i 
            LEFT JOIN categories c ON i.category_id = c.id 
            WHERE i.user_id = ?
        `, [req.user.id]);

        const [expenses] = await pool.execute(`
            SELECT e.*, c.name as category_name, 'expense' as type 
            FROM expenses e 
            LEFT JOIN categories c ON e.category_id = c.id 
            WHERE e.user_id = ?
        `, [req.user.id]);

        const transactions = [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(transactions.map(formatTransaction));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
    const { amount, category_id, description, date, type } = req.body;

    if (!amount || !category_id || !date || !type) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const table = type === 'income' ? 'income' : 'expenses';

        const [result] = await pool.execute(
            `INSERT INTO ${table} (user_id, category_id, amount, description, date) VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, category_id, amount, description || '', date]
        );

        // Fetch back to get joined data
        const [newTx] = await pool.execute(`
            SELECT t.*, c.name as category_name, ? as type 
            FROM ${table} t 
            LEFT JOIN categories c ON t.category_id = c.id 
            WHERE t.id = ?
        `, [type, result.insertId]);

        res.status(201).json(formatTransaction(newTx[0]));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id?type=income
// @access  Private
const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const { type } = req.query;

    if (!type || (type !== 'income' && type !== 'expense')) {
        return res.status(400).json({ message: 'Valid type (income or expense) query param required' });
    }

    try {
        const table = type === 'income' ? 'income' : 'expenses';

        const [txs] = await pool.execute(`SELECT * FROM ${table} WHERE id = ? AND user_id = ?`, [id, req.user.id]);

        if (txs.length === 0) {
            return res.status(404).json({ message: 'Transaction not found or unauthorized' });
        }

        await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
        res.json({ id: parseInt(id), type });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getTransactions, addTransaction, deleteTransaction };
