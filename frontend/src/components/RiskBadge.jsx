import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertCircle } from 'lucide-react';

export const RiskBadge = ({ score, status, priority, size = 'sm' }) => {
  if (status) {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          APPROVED
        </span>
      );
    }
    if (status === 'UNDER_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          REVIEW
        </span>
      );
    }
    if (status === 'BLOCKED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse-glow">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          BLOCKED
        </span>
      );
    }
  }

  if (priority) {
    const config = {
      CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
      HIGH: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config[priority] || config.LOW}`}>
        {priority}
      </span>
    );
  }

  // Score meter
  let color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (score >= 75) color = 'text-red-400 bg-red-500/10 border-red-500/30 font-bold';
  else if (score >= 45) color = 'text-amber-400 bg-amber-500/10 border-amber-500/20 font-semibold';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border font-mono ${color}`}>
      Risk: {score}/100
    </span>
  );
};

export default RiskBadge;
