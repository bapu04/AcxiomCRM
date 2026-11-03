import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import DashboardView from './pages/DashboardView';
import LiveStreamView from './pages/LiveStreamView';
import GraphVisualizerView from './pages/GraphVisualizerView';
import InvestigationQueueView from './pages/InvestigationQueueView';
import SimulatorWorkbenchView from './pages/SimulatorWorkbenchView';
import LoginView from './pages/LoginView';
import InvestigationModal from './components/InvestigationModal';
import { analyticsAPI, simulationAPI } from './services/api';

export function App() {
  const { isAuthenticated } = useAuth();
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialTab = (queryParams && queryParams.get('tab')) || 'dashboard';
  const showModalParam = queryParams && queryParams.get('modal') === 'true';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [driftDetected, setDriftDetected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inspectedTxn, setInspectedTxn] = useState(null);

  useEffect(() => {
    if (showModalParam && !inspectedTxn) {
      setInspectedTxn({
        txnReference: 'TXN-90241-BURST',
        senderAccount: 'ACC-MULE-4412',
        recipientAccount: 'ACC-EXIT-9019',
        amount: 84950.00,
        riskScore: 94.8,
        uncertaintyScore: 0.285,
        driftDeviation: 0.312,
        status: 'BLOCKED',
        xaiFactorsJson: JSON.stringify([
          { factor: 'Rapid Transaction Burst (>5 txns/min)', impact: 38.5, direction: 'INCREASES_RISK' },
          { factor: 'Money Mule Ring Circular Flow (Length 3)', impact: 31.2, direction: 'INCREASES_RISK' },
          { factor: 'Cross-Border High-Risk Gateway Routing', impact: 18.0, direction: 'INCREASES_RISK' },
          { factor: 'Off-Hours Velocity Anomaly (03:42 AM IST)', impact: 7.1, direction: 'INCREASES_RISK' }
        ])
      });
    }
  }, [showModalParam]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSystemMetrics = async () => {
      try {
        const [sumRes, simRes] = await Promise.all([
          analyticsAPI.getSummary(),
          simulationAPI.getStatus(),
        ]);
        setDriftDetected(sumRes.data?.conceptDriftDetected || false);
        setIsStreaming(simRes.data?.streamingActive || false);
      } catch (err) {
        // silent sync
      }
    };

    checkSystemMetrics();
    const interval = setInterval(checkSystemMetrics, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        driftDetected={driftDetected}
        isStreaming={isStreaming}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView onSelectTransaction={(txn) => setInspectedTxn(txn)} />
        )}
        {activeTab === 'stream' && (
          <LiveStreamView onSelectTransaction={(txn) => setInspectedTxn(txn)} />
        )}
        {activeTab === 'graph' && <GraphVisualizerView />}
        {activeTab === 'investigation' && <InvestigationQueueView />}
        {activeTab === 'simulator' && <SimulatorWorkbenchView />}
      </main>

      {/* Drill-down modal for any transaction clicked in stream or dashboard */}
      {inspectedTxn && (
        <InvestigationModal
          alert={{
            alertReference: inspectedTxn.txnReference,
            txnReference: inspectedTxn.txnReference,
            senderAccount: inspectedTxn.senderAccount,
            recipientAccount: inspectedTxn.recipientAccount,
            amount: inspectedTxn.amount,
            riskScore: inspectedTxn.riskScore,
            priority: inspectedTxn.riskScore >= 75 ? 'CRITICAL' : inspectedTxn.riskScore >= 60 ? 'HIGH' : 'MEDIUM',
            uncertaintyScore: inspectedTxn.uncertaintyScore,
            driftDeviation: inspectedTxn.driftDeviation,
            primaryReason: `Transaction scored at risk ${inspectedTxn.riskScore}/100 with uncertainty ${(inspectedTxn.uncertaintyScore * 100).toFixed(1)}%`,
            xaiFactorsJson: inspectedTxn.xaiFactorsJson,
            status: inspectedTxn.status === 'BLOCKED' ? 'OPEN' : 'DISMISSED',
          }}
          onClose={() => setInspectedTxn(null)}
          onResolved={() => setInspectedTxn(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 bg-slate-950/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FinTech Fraud Detection — Adaptive Intelligence Under Concept Drift</span>
          <span className="font-mono text-slate-600">Spring Boot 3 + MySQL + React + Recharts + scikit-learn</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
