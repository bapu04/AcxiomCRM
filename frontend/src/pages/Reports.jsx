import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Target,
  UserCheck,
  Download,
  FileText,
  DollarSign,
  Percent,
} from 'lucide-react';

export const Reports = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [pipelineData, setPipelineData] = useState(null);
  const [conversionData, setConversionData] = useState(null);
  const [userActivityData, setUserActivityData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pipeline') {
        const res = await axiosClient.get('/reports/pipeline');
        setPipelineData(res.data.data);
      } else if (activeTab === 'conversion') {
        const res = await axiosClient.get('/reports/conversion');
        setConversionData(res.data.data);
      } else if (activeTab === 'activity') {
        const res = await axiosClient.get('/reports/user-activity');
        setUserActivityData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            CRM Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Multi-dimensional reporting on deal pipelines, sales conversions, and representative performance
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'pipeline'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Pipeline Report
        </button>
        <button
          onClick={() => setActiveTab('conversion')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'conversion'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Target className="h-4 w-4" />
          Lead Conversion Report
        </button>
        {['Admin', 'Manager'].includes(user?.role) && (
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'activity'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            User Activity Report
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : activeTab === 'pipeline' ? (
        <div className="space-y-6">
          {/* Stage-wise Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Stage-Wise Pipeline Forecast</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Deal Count</th>
                  <th className="py-3 px-4">Total Amount ($)</th>
                  <th className="py-3 px-4">Weighted Amount ($)</th>
                  <th className="py-3 px-4">Avg Probability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pipelineData?.stageSummary?.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{s._id}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{s.totalDeals}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ${Number(s.totalAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                      ${Math.round(s.weightedAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {Math.round(s.avgProbability)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Owner-wise Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Owner-Wise Pipeline Distribution</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Sales Executive / Owner</th>
                  <th className="py-3 px-4">Open Deals</th>
                  <th className="py-3 px-4">Total Volume ($)</th>
                  <th className="py-3 px-4">Weighted Forecast ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pipelineData?.ownerSummary?.map((o, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{o.ownerName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{o.ownerEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{o.totalDeals}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ${Number(o.totalAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                      ${Math.round(o.weightedAmount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'conversion' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <p className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">Total Leads</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {conversionData?.totalLeads ?? 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <p className="text-xs uppercase font-semibold text-emerald-600 dark:text-emerald-400">Converted Leads</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                {conversionData?.convertedLeads ?? 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <p className="text-xs uppercase font-semibold text-blue-600 dark:text-blue-400">Qualified Leads</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                {conversionData?.qualifiedLeads ?? 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <p className="text-xs uppercase font-semibold text-indigo-600 dark:text-indigo-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
                {conversionData?.conversionRate ?? 0}%
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Lead Source Conversion Metrics</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Lead Source</th>
                  <th className="py-3 px-4">Total Inbound Leads</th>
                  <th className="py-3 px-4">Converted Count</th>
                  <th className="py-3 px-4">Source Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {conversionData?.sourceBreakdown?.map((src) => (
                  <tr key={src.source} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{src.source}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{src.total}</td>
                    <td className="py-3 px-4 font-medium text-emerald-600 dark:text-emerald-400">{src.converted}</td>
                    <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">{src.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Sales Representative Activity Breakdown</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Total Logged Activities</th>
                <th className="py-3 px-4">Phone Calls</th>
                <th className="py-3 px-4">Meetings</th>
                <th className="py-3 px-4">Emails</th>
                <th className="py-3 px-4">Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {userActivityData?.map((u) => (
                <tr key={u.userId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">{u.role}</td>
                  <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">{u.totalActivities}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{u.calls}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{u.meetings}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{u.emails}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{u.tasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
