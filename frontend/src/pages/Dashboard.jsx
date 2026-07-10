import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
);

const Dashboard = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const now = new Date();
                const res = await axios.get(`http://localhost:5000/api/reports?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
                setReport(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

    const balance = report ? (report.total_income - report.total_expenses) : 0;

    const doughnutData = {
        labels: report?.category_breakdown?.map(c => c.category) || [],
        datasets: [
            {
                data: report?.category_breakdown?.map(c => c.amount) || [],
                backgroundColor: [
                    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'
                ],
                borderWidth: 0,
            }
        ]
    };

    const doughnutOptions = {
        cutout: '75%',
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { color: 'inherit' } }
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-muted-foreground font-medium">Total Balance</h3>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <IndianRupee size={20} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-foreground">₹{balance.toLocaleString()}</p>
                </div>
                
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-muted-foreground font-medium">Monthly Income</h3>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-foreground">₹{report?.total_income.toLocaleString()}</p>
                </div>

                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-muted-foreground font-medium">Monthly Expenses</h3>
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                            <ArrowDownRight size={20} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-foreground">₹{report?.total_expenses.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-6">Expense by Category</h3>
                    {report?.category_breakdown?.length > 0 ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-10">No expense data for this month.</p>
                    )}
                </div>
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-center items-center">
                   <h3 className="text-lg font-semibold mb-6 self-start">Recent Alerts</h3>
                   <div className="w-full text-center text-muted-foreground">
                        No recent alerts. Great job keeping your expenses under budget!
                   </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
