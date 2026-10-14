import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../context/ThemeContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Manager':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 flex items-center justify-between px-6 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            A
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Acxiom<span className="text-indigo-600 dark:text-indigo-400">CRM</span>
          </span>
        </Link>
        <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          Enterprise v1.0
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark / Light Mode Toggle Button */}
        <ThemeToggle />

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 border-x border-slate-200 dark:border-slate-700/80 px-3">
          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
              {user?.name || 'User'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[11px] font-medium px-2 py-0.2 rounded border ${getRoleBadgeColor(
                  user?.role
                )}`}
              >
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
