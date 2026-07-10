import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Settings, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Transactions', icon: <Receipt size={20} />, path: '/transactions' },
        { name: 'Budgets', icon: <Wallet size={20} />, path: '/budgets' },
        { name: 'Reports', icon: <PieChart size={20} />, path: '/reports' }
    ];

    return (
        <aside className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Wallet size={28} />
                    ExpenseTracker
                </h2>
            </div>
            
            <nav className="flex-1 px-4 mt-6 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                isActive 
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`
                        }
                    >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <button 
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors font-medium"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
