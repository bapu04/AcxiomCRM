import React from 'react';
import {
  ShieldAlert,
  Activity,
  Layers,
  Network,
  Cpu,
  BarChart3,
  LogOut,
  Zap,
  Radio,
  AlertOctagon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activeTab, setActiveTab, driftDetected, isStreaming }) => {
  const { user, logout } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Fraud Intelligence', icon: BarChart3 },
    { id: 'stream', label: 'Live Detection Stream', icon: Activity },
    { id: 'graph', label: 'FraudGraph Topology', icon: Network },
    { id: 'investigation', label: 'Investigation Cases', icon: ShieldAlert },
    { id: 'simulator', label: 'Attack & Drift Lab', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldAlert className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  FinTech <span className="text-emerald-400">Fraud Detection</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Adaptive Financial Fraud Detection Under Concept Drift
              </p>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="hidden lg:flex items-center gap-2">
            {driftDetected && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 animate-pulse">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Concept Drift Active</span>
              </div>
            )}

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isStreaming
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'animate-ping' : ''}`} />
              <span>{isStreaming ? 'Live Stream Active' : 'Stream Paused'}</span>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200">{user?.fullName || user?.username}</div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase">{user?.role?.replace('ROLE_', '')}</div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-900 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
