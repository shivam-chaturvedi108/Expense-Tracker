import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Trash2 } from 'lucide-react';

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const fetchData = async () => {
        try {
            const [bRes, cRes] = await Promise.all([
                axios.get('http://localhost:5000/api/budgets'),
                axios.get('http://localhost:5000/api/categories')
            ]);
            setBudgets(bRes.data);
            setCategories(cRes.data.filter(c => c.type === 'expense'));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/budgets', {
                category_id: categoryId,
                amount: parseFloat(amount),
                month: currentMonth,
                year: currentYear
            });
            setAmount('');
            setCategoryId('');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/budgets/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const currentBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-2">Monthly Budgets</h2>
                <p className="text-muted-foreground">Set spending limits for your categories for the current month.</p>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target size={20} className="text-primary"/> 
                    Set New Budget Limit
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <select 
                            value={categoryId} 
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <input 
                            type="number" 
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            placeholder="Amount (₹)"
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                    </div>
                    <button type="submit" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">
                        Save Limit
                    </button>
                </form>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-secondary/50 text-muted-foreground text-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium">Limit</th>
                            <th className="px-6 py-4 font-medium text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {currentBudgets.map(b => (
                            <tr key={b.id} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-6 py-4 font-medium">
                                    <span className="bg-secondary px-3 py-1 rounded-full text-sm font-medium">
                                        {b.category_name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold">₹{parseFloat(b.amount).toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => handleDelete(b.id)}
                                        className="text-muted-foreground hover:text-destructive transition-colors p-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {currentBudgets.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-muted-foreground">
                                    No budgets set for this month.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Budgets;
