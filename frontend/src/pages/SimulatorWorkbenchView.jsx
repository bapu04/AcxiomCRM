import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Repeat,
  Zap,
  TrendingUp,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { simulationAPI } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export const SimulatorWorkbenchView = () => {
  const [streamingActive, setStreamingActive] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('NORMAL_STREAM');
  const [simResults, setSimResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const checkStatus = async () => {
    try {
      const res = await simulationAPI.getStatus();
      setStreamingActive(res.data?.streamingActive || false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleRunScenario = async (scenario, count = 10) => {
    setLoading(true);
    setStatusMessage('');
    try {
      const res = await simulationAPI.runBatch({ scenario, count });
      setSimResults(res.data || []);
      setStatusMessage(`Successfully injected ${res.data?.length || 0} synthetic transactions under scenario: ${scenario}`);
    } catch (err) {
      setStatusMessage('Simulation injection failed: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStreaming = async () => {
    try {
      const nextState = !streamingActive;
      const res = await simulationAPI.toggleStreaming(nextState, selectedScenario);
      setStreamingActive(res.data?.streamingActive);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Live Streaming Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Attack Simulation & Concept Drift Workbench</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Synthetic Stress Lab
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Inject synthetic money laundering topologies, velocity floods, and adversarial concept drift patterns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleStreaming}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
              streamingActive
                ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
            }`}
          >
            {streamingActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {streamingActive ? 'Halt Continuous Stream' : 'Start Continuous Stream'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Scenario Trigger Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scenario 1: Mule Ring */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 w-fit mb-3">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Circular Mule Ring Attack</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Injects a 3-way circular layering loop (A → B → C → A) with rapid layering wire amounts to test bounded DFS cycle detection.
            </p>
          </div>
          <button
            onClick={() => handleRunScenario('MULE_ATTACK', 3)}
            disabled={loading}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition disabled:opacity-50"
          >
            Inject Mule Ring
          </button>
        </div>

        {/* Scenario 2: Velocity Burst */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Velocity Burst Smurfing</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Floods 6 rapid transfers in under 10 seconds from a single account to test the short-window velocity anomaly engine.
            </p>
          </div>
          <button
            onClick={() => handleRunScenario('VELOCITY_BURST', 6)}
            disabled={loading}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition disabled:opacity-50"
          >
            Inject Velocity Burst
          </button>
        </div>

        {/* Scenario 3: Concept Drift */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Concept Drift Shift</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Injects sudden high-value transfer drift ($9k - $25k) causing population divergence and tripping the drift detector.
            </p>
          </div>
          <button
            onClick={() => handleRunScenario('HIGH_AMOUNT_DRIFT', 8)}
            disabled={loading}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition disabled:opacity-50"
          >
            Trigger Concept Drift
          </button>
        </div>

        {/* Scenario 4: Normal Consumer Stream */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Benign Baseline Batch</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Emits realistic retail consumer transactions ($20 - $350) adhering to established behavioral profiles.
            </p>
          </div>
          <button
            onClick={() => handleRunScenario('NORMAL_STREAM', 10)}
            disabled={loading}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition disabled:opacity-50"
          >
            Emit Normal Batch
          </button>
        </div>
      </div>

      {/* Live Simulation Outcomes Table */}
      {simResults.length > 0 && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Last Batch Evaluation Outcomes
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Evaluated: {simResults.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Accounts</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Uncertainty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {simResults.map((t) => (
                  <tr key={t.txnReference} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-300 font-bold">{t.txnReference}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {t.senderAccount} → {t.recipientAccount}
                    </td>
                    <td className="py-2.5 px-3 text-white font-bold">
                      ${Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{t.channel}</td>
                    <td className="py-2.5 px-3">
                      <RiskBadge score={t.riskScore} />
                    </td>
                    <td className="py-2.5 px-3">
                      <RiskBadge status={t.status} />
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {t.uncertaintyScore ? `${(t.uncertaintyScore * 100).toFixed(0)}%` : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatorWorkbenchView;
