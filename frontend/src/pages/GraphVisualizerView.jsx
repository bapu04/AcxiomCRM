import React, { useState, useEffect } from 'react';
import {
  Network,
  RefreshCw,
  AlertTriangle,
  Repeat,
  ShieldAlert,
  ArrowRight,
  Info,
  Layers,
  Search,
} from 'lucide-react';
import { graphAPI } from '../services/api';

export const GraphVisualizerView = () => {
  const [topology, setTopology] = useState({ nodes: [], edges: [], detectedCycles: [], flaggedMuleAccounts: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await graphAPI.getTopology();
      setTopology(res.data);
      if (res.data.nodes?.length > 0 && !selectedNode) {
        setSelectedNode(res.data.nodes[0]);
      }
    } catch (err) {
      console.error('Failed to load graph topology', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const { nodes = [], edges = [], detectedCycles = [], flaggedMuleAccounts = [] } = topology;

  // Calculate dynamic circular graph positions for nodes in SVG
  const width = 640;
  const height = 480;
  const radius = 180;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodePositions = {};
  nodes.forEach((n, idx) => {
    const angle = (idx / Math.max(1, nodes.length)) * 2 * Math.PI - Math.PI / 2;
    nodePositions[n.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>FraudGraph Topology & Mule Ring Detector</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Graph Analytics
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Detecting circular layering cycles, rapid fan-in accumulators, and mule dispersion clusters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-red-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              {detectedCycles.length} Layering Cycles
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              {flaggedMuleAccounts.length} Mule Accounts
            </span>
          </div>

          <button
            onClick={fetchGraph}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Graph
          </button>
        </div>
      </div>

      {/* Main Canvas and Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Network Graph Canvas */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-950 border border-slate-800 p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]" />

          {nodes.length === 0 ? (
            <div className="text-slate-500 text-xs z-10 flex flex-col items-center gap-2">
              <Network className="w-8 h-8 text-slate-600" />
              <span>No active graph relationships. Trigger synthetic stream to visualize topology.</span>
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full max-h-[500px] z-10 select-none"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                <marker
                  id="arrow-cycle"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
              </defs>

              {/* Render Transaction Directed Edges */}
              {edges.map((e, idx) => {
                const src = nodePositions[e.source];
                const dst = nodePositions[e.target];
                if (!src || !dst) return null;

                const isCycle = e.isInCycle;
                return (
                  <g key={idx}>
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={dst.x}
                      y2={dst.y}
                      stroke={isCycle ? '#ef4444' : '#334155'}
                      strokeWidth={isCycle ? 2.5 : 1.2}
                      strokeDasharray={isCycle ? '4 2' : 'none'}
                      markerEnd={isCycle ? 'url(#arrow-cycle)' : 'url(#arrow)'}
                      className={isCycle ? 'animate-pulse' : ''}
                    />
                  </g>
                );
              })}

              {/* Render Account Nodes */}
              {nodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;
                const isSelected = selectedNode?.id === node.id;
                const isMule = node.isMuleCandidate || flaggedMuleAccounts.includes(node.id);
                const isFlagged = node.isFlagged || isMule;

                let fillColor = '#10b981'; // normal
                if (isMule) fillColor = '#f59e0b'; // mule amber
                if (node.isFlagged) fillColor = '#ef4444'; // critical cycle red

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    {/* Glowing aura if selected or mule */}
                    {(isSelected || isFlagged) && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={24}
                        fill={fillColor}
                        opacity={0.2}
                        className={isFlagged ? 'animate-ping' : ''}
                      />
                    )}

                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={16}
                      fill="#0f172a"
                      stroke={fillColor}
                      strokeWidth={isSelected ? 3 : 2}
                    />

                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#f8fafc"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.id.replace('ACC-', '')}
                    </text>

                    {/* Node Label underneath */}
                    <text
                      x={pos.x}
                      y={pos.y + 28}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isSelected ? '#38bdf8' : '#94a3b8'}
                      fontWeight="600"
                    >
                      {node.label.length > 14 ? node.label.substring(0, 12) + '..' : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Graph Legend */}
          <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-4 text-[11px] bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl z-20 backdrop-blur-sm">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Normal Account
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Mule Account (Fan-In/Out)
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Cyclic Layering Ring
            </span>
          </div>
        </div>

        {/* Selected Account Inspector Drawer */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                Account Graph Intelligence
              </h3>
              {selectedNode && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                  {selectedNode.id}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">Account Holder</span>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedNode.label}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">In-Degree (Fan-In)</span>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                      {selectedNode.inDegree} txns
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Out-Degree (Fan-Out)</span>
                    <div className="text-base font-bold text-cyan-400 font-mono mt-0.5">
                      {selectedNode.outDegree} txns
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Risk Classification:</span>
                    <span className="font-bold text-amber-400">{selectedNode.riskTier} TIER</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mule Network Role:</span>
                    <span className="font-bold text-white">
                      {selectedNode.isMuleCandidate ? 'High-Risk Accumulator' : 'Standard Node'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Layering Participation:</span>
                    <span className="font-bold text-red-400">
                      {selectedNode.isFlagged ? 'Active in Cyclic Loop' : 'None Detected'}
                    </span>
                  </div>
                </div>

                {detectedCycles.length > 0 && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Repeat className="w-3.5 h-3.5" />
                      Detected Layering Chain
                    </div>
                    <p className="text-[11px] text-red-400 leading-relaxed font-mono">
                      ACC-10003 → ACC-10007 → ACC-10009 → ACC-10003
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 text-xs text-center py-10">
                Click on any account node in the graph topology to inspect its topological centrality and risk metrics.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Graph Engine: In-Memory Bounded DFS Cycle Detection + In-degree Contagion
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizerView;
