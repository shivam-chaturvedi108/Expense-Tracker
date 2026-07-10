const pool = require('../config/db');

// @desc    Get aggregated report for a specific month/year
// @route   GET /api/reports?month=7&year=2024
// @access  Private
const getMonthlyReport = async (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required' });
    }

    try {
        // Total Income
        const [incomeRes] = await pool.execute(
            'SELECT SUM(amount) as total_income FROM income WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?',
            [req.user.id, month, year]
        );

        // Total Expenses
        const [expenseRes] = await pool.execute(
            'SELECT SUM(amount) as total_expenses FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?',
            [req.user.id, month, year]
        );

        // Expense by Category
        const [categoryExpenses] = await pool.execute(`
            SELECT c.name as category, SUM(e.amount) as amount
            FROM expenses e
            JOIN categories c ON e.category_id = c.id
            WHERE e.user_id = ? AND MONTH(e.date) = ? AND YEAR(e.date) = ?
            GROUP BY c.id
        `, [req.user.id, month, year]);

        res.json({
            total_income: parseFloat(incomeRes[0].total_income || 0),
            total_expenses: parseFloat(expenseRes[0].total_expenses || 0),
            category_breakdown: categoryExpenses.map(c => ({
                ...c,
                amount: parseFloat(c.amount)
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getMonthlyReport };
