import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  Zap,
  TrendingUp,
  Cpu,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { analyticsAPI, transactionAPI } from '../services/api';

export const DashboardView = ({ onSelectTransaction }) => {
  const [summary, setSummary] = useState(null);
  const [driftReports, setDriftReports] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, driftRes, txnsRes] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getDriftReports(),
        transactionAPI.getRecent(),
      ]);
      setSummary(sumRes.data);
      setDriftReports(driftRes.data || []);
      setRecentTxns(txnsRes.data || []);
    } catch (err) {
      console.error('Failed to load analytics dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Prepare chart series from recent transactions
  const timeSeriesData = [...recentTxns].reverse().map((t, idx) => ({
    time: t.timestamp ? new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `T-${idx}`,
    amount: Number(t.amount) || 0,
    risk: t.riskScore || 0,
    isFlagged: t.riskScore >= 45 ? 1 : 0,
  }));

  const priorityData = summary?.priorityDistribution
    ? Object.entries(summary.priorityDistribution).map(([name, count]) => ({
        name,
        count,
      }))
    : [
        { name: 'CRITICAL', count: 2 },
        { name: 'HIGH', count: 3 },
        { name: 'MEDIUM', count: 1 },
        { name: 'LOW', count: 12 },
      ];

  // Concept drift simulation line data
  const driftTimeline = [
    { sample: 'W-1', score: 0.12, threshold: 0.38 },
    { sample: 'W-2', score: 0.15, threshold: 0.38 },
    { sample: 'W-3', score: 0.19, threshold: 0.38 },
    { sample: 'W-4', score: 0.22, threshold: 0.38 },
    { sample: 'W-5', score: summary?.conceptDriftScore || 0.42, threshold: 0.38 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>FinTech Fraud Detection Command Center</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Real-time Ingestion
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-layer detection combining transaction graph relationships, velocity behavior drift, and epistemic model uncertainty.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Metrics
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Volume"
          value={summary?.totalTransactions ?? '...'}
          subtitle="Transactions evaluated live"
          icon={Activity}
          color="cyan"
          badge="+100% Real-time"
        />

        <MetricCard
          title="Fraud Anomaly Rate"
          value={`${summary?.fraudRatePercent ?? 0.0}%`}
          subtitle={`${summary?.flaggedTransactions ?? 0} suspicious txns intercepted`}
          icon={ShieldAlert}
          color="red"
          badge={summary?.fraudRatePercent > 5 ? 'High Alert' : 'Normal'}
        />

        <MetricCard
          title="Concept Drift Index"
          value={summary?.conceptDriftScore ?? '0.12'}
          subtitle={summary?.conceptDriftDetected ? 'Statistically significant distribution shift' : 'Stable population baseline'}
          icon={Cpu}
          color={summary?.conceptDriftDetected ? 'purple' : 'emerald'}
          badge={summary?.conceptDriftDetected ? 'DRIFT TRIP' : 'BASELINE'}
        />

        <MetricCard
          title="Avg Engine Latency"
          value={`${summary?.avgDetectionLatencyMs ?? 14.5} ms`}
          subtitle="Graph + Behavioral scoring roundtrip"
          icon={Zap}
          color="emerald"
          badge="Ultra-low"
        />
      </div>

      {/* Primary Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Flow & Anomaly Timeline (Area Chart) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Streaming Transaction Velocity & Risk Density
              </h3>
              <p className="text-xs text-slate-400">
                Temporal sequence of transaction amounts vs calculated risk scores
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Amount ($)
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Risk Score
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData.slice(-15)}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" />
                <Area type="monotone" dataKey="risk" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Case Distribution (Bar Chart) */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Investigation Priority Queue
            </h3>
            <p className="text-xs text-slate-400">
              Active alerts grouped by criticality
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row: Concept Drift & Investigation Uncertainty Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adaptive Concept Drift Monitor */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>Adaptive Concept Drift Tracker (ADWIN / Page-Hinkley)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Monitors statistical divergence from baseline spend and velocity distributions
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Threshold: 0.38
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={driftTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sample" stroke="#64748b" fontSize={10} />
                <YAxis domain={[0, 1.0]} stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <ReferenceLine y={0.38} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Drift Limit', fill: '#ef4444', fontSize: 10 }} />
                <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Uncertainty & Priority Matrix */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Novelty: Active Learning Uncertainty Matrix
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                P(Fraud) × Uncertainty
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Prioritizes investigations into transactions near complex decision boundaries or new drift topologies.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="font-bold text-red-400 flex items-center justify-between">
                  <span>High Risk / Low Uncertainty</span>
                  <span className="text-[10px] font-mono">Q1</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">Autonomous Block</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Definitive cyclic layering or known mule ring.</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="font-bold text-amber-400 flex items-center justify-between">
                  <span>High Risk / High Uncertainty</span>
                  <span className="text-[10px] font-mono">Q2</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">Priority Human Review</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Novel adversarial evasion, emergent drift pattern.</p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="font-bold text-cyan-400 flex items-center justify-between">
                  <span>Low Risk / High Uncertainty</span>
                  <span className="text-[10px] font-mono">Q3</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">Active Learning Sample</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Borderline consumer anomaly, retraining candidate.</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="font-bold text-emerald-400 flex items-center justify-between">
                  <span>Low Risk / Low Uncertainty</span>
                  <span className="text-[10px] font-mono">Q4</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">Frictionless Approval</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Standard verified consumer transaction.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Prioritization Metric: Priority = 0.6 × Risk + 0.4 × Uncertainty</span>
            <span className="text-emerald-400 font-mono">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
