import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, Ban, MessageSquare, AlertTriangle, ArrowRight } from 'lucide-react';
import XaiFactorWaterfall from './XaiFactorWaterfall';
import RiskBadge from './RiskBadge';
import { alertAPI } from '../services/api';

export const InvestigationModal = ({ alert, onClose, onResolved }) => {
  if (!alert) return null;

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleResolve = async (status) => {
    setSubmitting(true);
    setError(null);
    try {
      await alertAPI.resolve(alert.alertReference, {
        status,
        investigatorNotes: notes,
      });
      if (onResolved) onResolved(alert.alertReference, status);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update alert status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{alert.alertReference}</h3>
                <RiskBadge priority={alert.priority} />
                <RiskBadge score={alert.riskScore} />
              </div>
              <p className="text-xs text-slate-400">
                Transaction Reference: <span className="font-mono text-slate-300">{alert.txnReference}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Transaction Flow Blueprint */}
        <div className="my-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sender Account</span>
            <div className="font-mono font-bold text-sm text-slate-200">{alert.senderAccount}</div>
          </div>

          <div className="flex flex-col items-center px-4">
            <span className="text-xs font-mono font-bold text-emerald-400">${alert.amount?.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-slate-500 my-1">
              <div className="h-0.5 w-12 bg-slate-700" />
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Transfer</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recipient Account</span>
            <div className="font-mono font-bold text-sm text-slate-200">{alert.recipientAccount}</div>
          </div>
        </div>

        {/* Primary Flag Reason */}
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Flag Trigger: </strong>
            {alert.primaryReason}
          </div>
        </div>

        {/* Explainable AI Factor Breakdown */}
        <div className="mb-6">
          <XaiFactorWaterfall
            xaiFactorsJson={alert.xaiFactorsJson}
            uncertaintyScore={alert.uncertaintyScore}
            driftDeviation={alert.driftDeviation}
          />
        </div>

        {/* Investigator Notes */}
        <div className="mb-6 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Investigator Case Audit Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add investigation findings, KYC verification status, or action justifications..."
            rows={3}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition resize-none placeholder:text-slate-600"
          />
          {alert.investigatorNotes && (
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 whitespace-pre-wrap font-mono">
              <div className="text-slate-500 font-bold mb-1">Audit Trail History:</div>
              {alert.investigatorNotes}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => handleResolve('DISMISSED')}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Dismiss Alert
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleResolve('FALSE_POSITIVE')}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Mark False Positive
            </button>
            <button
              onClick={() => handleResolve('CONFIRMED_FRAUD')}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition flex items-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              Confirm Fraud & Freeze Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestigationModal;
