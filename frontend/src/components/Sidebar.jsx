import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Target,
  TrendingUp,
  CalendarCheck,
  BarChart3,
  UserCheck,
  History,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Leads', path: '/leads', icon: Target },
    { name: 'Opportunities', path: '/opportunities', icon: TrendingUp },
    { name: 'Follow-Ups', path: '/follow-ups', icon: CalendarCheck },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const adminItems = [
    { name: 'User Management', path: '/users', icon: UserCheck },
    { name: 'Audit Logs', path: '/audit-logs', icon: History },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800/80 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 flex-shrink-0 transition-colors duration-200">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            CRM Modules
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Administration Section */}
        {isAdmin && (
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Administration
            </p>
            <nav className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Role Scope Notice */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold text-slate-900 dark:text-slate-200">Current Scope</p>
        <p className="mt-1">
          {isAdmin && 'Full System Administration'}
          {isManager && 'Team & Pipeline Oversight'}
          {user?.role === 'SalesExecutive' && 'Assigned Records Only'}
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
