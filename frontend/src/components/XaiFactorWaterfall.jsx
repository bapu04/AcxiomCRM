import React from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, Info, HelpCircle } from 'lucide-react';

export const XaiFactorWaterfall = ({ xaiFactorsJson, uncertaintyScore, driftDeviation }) => {
  let factors = [];
  try {
    factors = typeof xaiFactorsJson === 'string' ? JSON.parse(xaiFactorsJson) : xaiFactorsJson || [];
  } catch (e) {
    factors = [];
  }

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'HIGH':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'INFO':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-400" />
          Explainable AI (XAI) Risk Factor Attribution
        </h4>
        <div className="flex items-center gap-3 text-xs">
          {uncertaintyScore !== undefined && (
            <span className="text-slate-400 font-mono">
              Uncertainty: <strong className="text-cyan-400">{(uncertaintyScore * 100).toFixed(1)}%</strong>
            </span>
          )}
          {driftDeviation !== undefined && (
            <span className="text-slate-400 font-mono">
              Drift Index: <strong className="text-purple-400">{(driftDeviation * 100).toFixed(1)}%</strong>
            </span>
          )}
        </div>
      </div>

      {factors.length === 0 ? (
        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-400 text-xs text-center">
          No anomalous factors detected. Transaction matches baseline behavioral patterns.
        </div>
      ) : (
        <div className="space-y-2.5">
          {factors.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityStyle(
                      item.severity
                    )}`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{item.factor}</span>
                </div>
                {item.impact > 0 && (
                  <span className="text-xs font-mono font-bold text-red-400 flex items-center">
                    +{item.impact} pts
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed pl-1">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default XaiFactorWaterfall;
