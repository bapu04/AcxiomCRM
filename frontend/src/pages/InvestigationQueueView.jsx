import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  Ban,
  Clock,
  ArrowRight,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Download,
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import InvestigationModal from '../components/InvestigationModal';
import { alertAPI } from '../services/api';

export const InvestigationQueueView = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [sortBy, setSortBy] = useState('PRIORITIZED'); // PRIORITIZED or DATE
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      if (sortBy === 'PRIORITIZED') {
        const res = await alertAPI.getPrioritized(30);
        setAlerts(res.data || []);
      } else {
        const res = await alertAPI.getList(0, 30);
        setAlerts(res.data?.content || []);
      }
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [sortBy]);

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const handleResolved = (reference, newStatus) => {
    setAlerts((prev) =>
      prev.map((item) =>
        item.alertReference === reference ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleExportCSV = () => {
    if (filteredAlerts.length === 0) return;
    const headers = [
      'Alert Reference',
      'Txn Reference',
      'Sender',
      'Recipient',
      'Amount',
      'Risk Score',
      'Priority',
      'Uncertainty Score',
      'Status',
      'Primary Trigger Reason',
      'Created At',
    ];
    const rows = filteredAlerts.map((a) => [
      a.alertReference,
      a.txnReference,
      a.senderAccount,
      a.recipientAccount,
      a.amount,
      a.riskScore,
      a.priority,
      (Number(a.uncertaintyScore || 0) * 100).toFixed(1) + '%',
      a.status,
      `"${(a.primaryReason || '').replace(/"/g, '""')}"`,
      a.createdAt || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fraudgraph_cases_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Investigation Case Management & Prioritization</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-red-500/10 text-red-400 border border-red-500/20">
                {filteredAlerts.length} Cases
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Prioritized queue fusing Risk Severity × Epistemic Model Uncertainty for Active Learning
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Prioritization Sort toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSortBy('PRIORITIZED')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                sortBy === 'PRIORITIZED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Risk + Uncertainty Priority
            </button>
            <button
              onClick={() => setSortBy('DATE')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                sortBy === 'DATE'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Most Recent
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            title="Export Case Audit Report (CSV)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchAlerts}
            title="Refresh Alert Queue"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2 text-xs">
        {['OPEN', 'INVESTIGATING', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'ALL'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === st
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Alert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No investigation cases match the selected status filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.alertReference}
              onClick={() => setSelectedAlert(alert)}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex flex-col justify-between group backdrop-blur-sm hover:shadow-xl hover:shadow-emerald-950/20"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-slate-300">
                    {alert.alertReference}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <RiskBadge priority={alert.priority} />
                    <RiskBadge score={alert.riskScore} />
                  </div>
                </div>

                {/* Account Flow */}
                <div className="my-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-300">{alert.senderAccount}</span>
                  <div className="flex items-center gap-1 text-slate-500">
                    <span className="text-[11px] font-bold text-white">${alert.amount?.toLocaleString()}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-slate-300">{alert.recipientAccount}</span>
                </div>

                <div className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  <strong className="text-slate-300">Trigger: </strong>
                  {alert.primaryReason}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-slate-500 font-mono">
                  <span>Uncertainty:</span>
                  <span className="text-cyan-400 font-semibold">
                    {alert.uncertaintyScore ? `${(alert.uncertaintyScore * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>

                <span className="text-emerald-400 group-hover:translate-x-0.5 transition font-semibold flex items-center gap-1">
                  Investigate <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Investigation Modal */}
      {selectedAlert && (
        <InvestigationModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onResolved={handleResolved}
        />
      )}
    </div>
  );
};

export default InvestigationQueueView;
