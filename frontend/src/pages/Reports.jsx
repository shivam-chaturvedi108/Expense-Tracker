import React, { useState, useEffect } from 'react';
import api from "../api";
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

const Reports = () => {
    const [reportData, setReportData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [rRes, tRes] = await Promise.all([
                    api.get(`/api/reports?month=${month}&year=${year}`),
                    api.get('/api/transactions')
                ]);
                setReportData(rRes.data);
                
                // filter transactions for the selected month/year
                const filteredTx = tRes.data.filter(t => {
                    const d = new Date(t.date);
                    return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
                });
                setTransactions(filteredTx);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAll();
    }, [month, year]);

    const exportPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(`Expense Report (${month}/${year})`, 14, 22);
        
        doc.setFontSize(12);
        doc.text(`Total Income: Rs ${reportData?.total_income || 0}`, 14, 32);
        doc.text(`Total Expenses: Rs ${reportData?.total_expenses || 0}`, 14, 40);

        const tableColumn = ["Date", "Description", "Category", "Type", "Amount"];
        const tableRows = [];

        transactions.forEach(tx => {
            const txData = [
                new Date(tx.date).toLocaleDateString(),
                tx.description || '-',
                tx.category_name,
                tx.type,
                `Rs ${tx.amount}`
            ];
            tableRows.push(txData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });

        doc.save(`expense_report_${month}_${year}.pdf`);
    };

    const exportCSV = () => {
        const csvData = transactions.map(tx => ({
            Date: new Date(tx.date).toLocaleDateString(),
            Description: tx.description || '',
            Category: tx.category_name,
            Type: tx.type,
            Amount: tx.amount
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `expense_report_${month}_${year}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Export Reports</h2>
                    <p className="text-muted-foreground">Download your financial data as PDF or CSV.</p>
                </div>

                <div className="flex items-center gap-3">
                    <select 
                        value={month} 
                        onChange={(e) => setMonth(e.target.value)}
                        className="bg-background border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                    <select 
                        value={year} 
                        onChange={(e) => setYear(e.target.value)}
                        className="bg-background border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        {[2023, 2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">PDF Report</h3>
                    <p className="text-muted-foreground mb-6 max-w-xs">A beautifully formatted document containing your summary and all transactions.</p>
                    <button 
                        onClick={exportPDF}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-red-500/25"
                    >
                        <Download size={20} />
                        Download PDF
                    </button>
                </div>

                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">CSV Export</h3>
                    <p className="text-muted-foreground mb-6 max-w-xs">Raw transaction data suitable for importing into Excel, Google Sheets, or other tools.</p>
                    <button 
                        onClick={exportCSV}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-green-500/25"
                    >
                        <Download size={20} />
                        Download CSV
                    </button>
                </div>
            </div>
            
            {/* Quick summary for the selected month */}
            {reportData && (
                 <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex justify-around">
                     <div className="text-center">
                         <p className="text-muted-foreground text-sm mb-1">Total Income</p>
                         <p className="text-2xl font-bold text-emerald-500">₹{reportData.total_income || 0}</p>
                     </div>
                     <div className="w-px bg-border"></div>
                     <div className="text-center">
                         <p className="text-muted-foreground text-sm mb-1">Total Expenses</p>
                         <p className="text-2xl font-bold text-destructive">₹{reportData.total_expenses || 0}</p>
                     </div>
                     <div className="w-px bg-border"></div>
                     <div className="text-center">
                         <p className="text-muted-foreground text-sm mb-1">Transactions</p>
                         <p className="text-2xl font-bold">{transactions.length}</p>
                     </div>
                 </div>
            )}
        </div>
    );
};

export default Reports;
