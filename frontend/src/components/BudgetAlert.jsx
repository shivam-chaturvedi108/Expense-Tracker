import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle } from 'lucide-react';

const BudgetAlert = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const now = new Date();
                const month = now.getMonth() + 1;
                const year = now.getFullYear();

                const [budgetRes, reportRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/budgets'),
                    axios.get(`http://localhost:5000/api/reports?month=${month}&year=${year}`)
                ]);

                const budgets = budgetRes.data.filter(b => b.month === month && b.year === year);
                const categories = reportRes.data.category_breakdown;

                const newAlerts = [];

                budgets.forEach(budget => {
                    const spentData = categories.find(c => c.category === budget.category_name);
                    const spent = spentData ? spentData.amount : 0;
                    const limit = parseFloat(budget.amount);
                    
                    if (limit > 0) {
                        const percentage = (spent / limit) * 100;
                        if (percentage >= 90) {
                            newAlerts.push({
                                category: budget.category_name,
                                percentage: percentage.toFixed(1),
                                spent,
                                limit,
                                remaining: limit - spent
                            });
                        }
                    }
                });

                setAlerts(newAlerts);
            } catch (err) {
                console.error("Error fetching budget alerts", err);
            }
        };

        fetchAlerts();
    }, []);

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-4 mb-6">
            {alerts.map((alert, idx) => (
                <div key={idx} className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="mt-0.5" size={20} />
                    <div>
                        <h4 className="font-semibold text-sm">Budget Alert: {alert.category}</h4>
                        <p className="text-sm opacity-90 mt-1">
                            You have used {alert.percentage}% of your budget. <br/>
                            Spent: ₹{alert.spent.toLocaleString()} / Limit: ₹{alert.limit.toLocaleString()} (Remaining: ₹{alert.remaining.toLocaleString()})
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BudgetAlert;
