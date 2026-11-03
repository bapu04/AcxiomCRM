import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Play,
  Pause,
  PlusCircle,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Send,
  X,
  CreditCard,
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { transactionAPI, simulationAPI } from '../services/api';

const DEMO_ACCOUNTS = [
  { id: 'ACC-10001', name: 'Acme Retail Logistics' },
  { id: 'ACC-10002', name: 'Elena Rostova' },
  { id: 'ACC-10003', name: 'Apex Horizon Capital LLC' },
  { id: 'ACC-10004', name: 'Devon Park Tech Hub' },
  { id: 'ACC-10005', name: 'Global Pay Remittance' },
  { id: 'ACC-10006', name: 'Clara Oswald' },
  { id: 'ACC-10007', name: 'Shell Entity Holding B.V.' },
  { id: 'ACC-10008', name: 'David Kim' },
  { id: 'ACC-10009', name: 'Nexus Rapid Liquidity' },
  { id: 'ACC-10010', name: 'Maya Patel' },
];

export const LiveStreamView = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [minRisk, setMinRisk] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Custom transaction form state
  const [customTxn, setCustomTxn] = useState({
    senderAccount: 'ACC-10001',
    recipientAccount: 'ACC-10002',
    amount: '120.00',
    type: 'TRANSFER',
    channel: 'MOBILE_APP',
    location: 'New York, US',
    ipAddress: '198.51.100.45',
  });
  const [submittingCustom, setSubmittingCustom] = useState(false);

  const fetchStream = async () => {
    if (isPaused) return;
    try {
      const res = await transactionAPI.getRecent();
      setTransactions(res.data || []);
    } catch (err) {
      console.error('Failed to load transaction stream', err);
    }
  };

  useEffect(() => {
    fetchStream();
    const interval = setInterval(fetchStream, 2500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleInjectSingle = async () => {
    setInjecting(true);
    try {
      await simulationAPI.generateSingle();
      await fetchStream();
    } catch (err) {
      console.error('Failed to inject transaction', err);
    } finally {
      setInjecting(false);
    }
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    setSubmittingCustom(true);
    try {
      const res = await transactionAPI.create({
        ...customTxn,
        amount: Number(customTxn.amount),
      });
      setShowCustomModal(false);
      await fetchStream();
      if (onSelectTransaction && res.data) {
        onSelectTransaction(res.data);
      }
    } catch (err) {
      console.error('Failed to create transaction', err);
    } finally {
      setSubmittingCustom(false);
    }
  };

  const applyPreset = (sender, recipient, amount, channel, location) => {
    setCustomTxn({
      ...customTxn,
      senderAccount: sender,
      recipientAccount: recipient,
      amount: String(amount),
      channel,
      location,
    });
  };

  const filteredTxns = transactions.filter((t) => {
    const matchesSearch =
      t.txnReference?.toLowerCase().includes(search.toLowerCase()) ||
      t.senderAccount?.toLowerCase().includes(search.toLowerCase()) ||
      t.recipientAccount?.toLowerCase().includes(search.toLowerCase()) ||
      t.channel?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesRisk = (t.riskScore || 0) >= minRisk;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-5">
      {/* Stream Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Live Ingestion & Scoring Stream</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300">
                {filteredTxns.length} showing
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Streaming FinTech transactions through graph topology & adaptive behavioral engines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isPaused
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            {isPaused ? 'Resume Stream' : 'Pause Stream'}
          </button>

          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            Test Custom Txn
          </button>

          <button
            onClick={handleInjectSingle}
            disabled={injecting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <PlusCircle className={`w-3.5 h-3.5 ${injecting ? 'animate-spin' : ''}`} />
            Inject Synthetic Txn
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, account, channel..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['ALL', 'APPROVED', 'UNDER_REVIEW', 'BLOCKED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  filterStatus === st
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">Min Risk: {minRisk}</span>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minRisk}
              onChange={(e) => setMinRisk(Number(e.target.value))}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Txn Reference</th>
              <th className="py-3 px-4">Flow (Sender → Recipient)</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4">Risk & Status</th>
              <th className="py-3 px-4">Uncertainty</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredTxns.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                  No streaming transactions match the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredTxns.map((t) => (
                <tr
                  key={t.txnReference}
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => onSelectTransaction && onSelectTransaction(t)}
                >
                  <td className="py-3 px-4 font-semibold text-slate-300">
                    {t.txnReference}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <div className="flex items-center gap-1.5 font-sans">
                      <span className="font-mono text-slate-300">{t.senderAccount}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-slate-300">{t.recipientAccount}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    ${Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                      {t.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <RiskBadge status={t.status} />
                      <RiskBadge score={t.riskScore} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {t.uncertaintyScore ? `${(t.uncertaintyScore * 100).toFixed(0)}%` : '0%'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectTransaction) onSelectTransaction(t);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Test Custom Transaction Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Simulate Custom Transaction</h3>
                  <p className="text-xs text-slate-400">
                    Test graph detection, behavioral Z-score, and uncertainty calculation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Scenario Presets */}
            <div className="my-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Quick Test Scenarios:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('ACC-10001', 'ACC-10002', 65.0, 'POS', 'New York, US')}
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 text-left transition"
                >
                  <div className="font-semibold text-emerald-400">Retail Spend</div>
                  <div className="text-[10px] text-slate-400">$65.00 · POS</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('ACC-10003', 'ACC-10007', 4200.0, 'WIRE', 'London, UK')}
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 text-left transition"
                >
                  <div className="font-semibold text-red-400">Mule Layering</div>
                  <div className="text-[10px] text-slate-400">$4,200 · WIRE</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('ACC-10002', 'ACC-10006', 16500.0, 'WIRE', 'Frankfurt, DE')}
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 text-left transition"
                >
                  <div className="font-semibold text-amber-400">High Outlier</div>
                  <div className="text-[10px] text-slate-400">$16,500 · WIRE</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sender Account</label>
                  <select
                    value={customTxn.senderAccount}
                    onChange={(e) => setCustomTxn({ ...customTxn, senderAccount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {DEMO_ACCOUNTS.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.id} ({acc.name.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Recipient Account</label>
                  <select
                    value={customTxn.recipientAccount}
                    onChange={(e) => setCustomTxn({ ...customTxn, recipientAccount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {DEMO_ACCOUNTS.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.id} ({acc.name.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={customTxn.amount}
                    onChange={(e) => setCustomTxn({ ...customTxn, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Channel</label>
                  <select
                    value={customTxn.channel}
                    onChange={(e) => setCustomTxn({ ...customTxn, channel: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="MOBILE_APP">MOBILE_APP</option>
                    <option value="WEB">WEB</option>
                    <option value="WIRE">WIRE (High Risk)</option>
                    <option value="ATM">ATM</option>
                    <option value="POS">POS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location Origin</label>
                <input
                  type="text"
                  value={customTxn.location}
                  onChange={(e) => setCustomTxn({ ...customTxn, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCustom}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingCustom ? 'Scoring...' : 'Score & Ingest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamView;
