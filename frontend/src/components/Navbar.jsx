import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, User } from 'lucide-react';

const Navbar = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
            <div>
                <h1 className="text-xl font-semibold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                <p className="text-sm text-muted-foreground">Here's what's happening with your finances today.</p>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
