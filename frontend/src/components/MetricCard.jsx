import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'emerald', badge }) => {
  const colorMap = {
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    red: 'from-red-500/10 to-transparent border-red-500/20 text-red-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400',
    cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400',
    purple: 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colorMap[color]} border p-5 backdrop-blur-sm bg-slate-900/60 transition hover:border-slate-700`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
            <Icon className="w-5 h-5 text-slate-300" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </div>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-1 text-xs text-slate-400 flex items-center gap-1">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
