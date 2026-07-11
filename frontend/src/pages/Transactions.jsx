import React, { useState, useEffect } from 'react';
import api from "../api";
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import BudgetAlert from '../components/BudgetAlert';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchData = async () => {
        try {
            const [txRes, catRes] = await Promise.all([
                api.get('/api/transactions'),
                api.get('/api/categories')
            ]);
            setTransactions(txRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredCategories = categories.filter(c => c.type === type);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/transactions', {
                type,
                amount: parseFloat(amount),
                category_id: categoryId,
                description,
                date
            });
            setShowForm(false);
            setAmount('');
            setDescription('');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id, txType) => {
        try {
            await api.delete(`/api/transactions/${id}?type=${txType}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <BudgetAlert />
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Transactions</h2>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium text-sm"
                >
                    <Plus size={18} />
                    {showForm ? 'Cancel' : 'Add Transaction'}
                </button>
            </div>

            {showForm && (
                <div className="bg-card border border-border p-6 rounded-2xl mb-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm mb-1 text-muted-foreground">Type</label>
                            <select 
                                value={type} 
                                onChange={(e) => { setType(e.target.value); setCategoryId(''); }}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-muted-foreground">Category</label>
                            <select 
                                value={categoryId} 
                                onChange={(e) => setCategoryId(e.target.value)}
                                required
                                className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
                            >
                                <option value="">Select Category</option>
                                {filteredCategories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-muted-foreground">Amount</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                placeholder="0.00"
                                className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-muted-foreground">Date</label>
                            <input 
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-sm mb-1 text-muted-foreground">Description (Optional)</label>
                            <input 
                                type="text" 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="E.g. Groceries at Walmart"
                                className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                        <div className="lg:col-span-3 flex justify-end">
                            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                                Save Transaction
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-secondary/50 text-muted-foreground text-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Description</th>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium text-right">Amount</th>
                            <th className="px-6 py-4 font-medium text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {transactions.map(tx => (
                            <tr key={tx.id + tx.type} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-6 py-4 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium">{tx.description || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-secondary px-3 py-1 rounded-full text-xs font-medium">
                                        {tx.category_name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium">
                                    <div className={`flex items-center justify-end gap-1 ${tx.type === 'income' ? 'text-emerald-500' : 'text-destructive'}`}>
                                        {tx.type === 'income' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                                        ₹{tx.amount.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => handleDelete(tx.id, tx.type)}
                                        className="text-muted-foreground hover:text-destructive transition-colors p-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">
                                    No transactions found. Add one above!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Transactions;
