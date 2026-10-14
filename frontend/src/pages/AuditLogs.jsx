import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Pagination from '../components/Pagination';
import {
  History,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  ShieldCheck,
  X,
  Calendar,
} from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [userEmailSearch, setUserEmailSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Inspector modal
  const [inspectLog, setInspectLog] = useState(null);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entityName = entityFilter;
      if (userEmailSearch) params.userEmail = userEmailSearch;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axiosClient.get('/audit-logs', { params });
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, actionFilter, entityFilter]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAuditLogs();
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'FAILED_LOGIN':
        return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'LOGOUT':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'CREATE':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'UPDATE':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'DELETE':
        return 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'ROLE_CHANGE':
      case 'SECURITY':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'CONVERT':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System & Security Audit Log
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Append-only tamper-evident audit trail capturing logins, CRUD events, role modifications, and business changes
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3 transition-colors duration-200"
      >
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={userEmailSearch}
            onChange={(e) => setUserEmailSearch(e.target.value)}
            placeholder="Filter by user email..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-36 py-2 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="FAILED_LOGIN">FAILED_LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="CONVERT">CONVERT</option>
          <option value="ROLE_CHANGE">ROLE_CHANGE</option>
          <option value="SECURITY">SECURITY</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-36 py-2 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Modules</option>
          <option value="Auth">Auth</option>
          <option value="Customer">Customer</option>
          <option value="Lead">Lead</option>
          <option value="Opportunity">Opportunity</option>
          <option value="FollowUp">FollowUp</option>
          <option value="User">User</option>
          <option value="Activity">Activity</option>
        </select>

        <button
          type="submit"
          className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
        >
          Filter Logs
        </button>
      </form>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-600 dark:text-slate-400 tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User & Role</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Module / Record ID</th>
                <th className="py-3.5 px-4">Event Details</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500 font-sans">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                      Loading audit entries...
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500 font-sans">
                    No audit records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/75 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white font-sans">{log.userEmail}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">[{log.userRole}]</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-sans">{log.entityName}</span>
                      {log.recordId && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
                          ID: {log.recordId}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{log.ipAddress}</td>
                    <td className="py-3 px-4 text-right">
                      {(log.oldValue || log.newValue) && (
                        <button
                          onClick={() => setInspectLog(log)}
                          title="Inspect JSON Payload"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* JSON Inspection Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-3xl w-full p-6 border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col transition-colors duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Audit Record Payload Inspector
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Action: {inspectLog.action} • Entity: {inspectLog.entityName} • ID:{' '}
                  {inspectLog.recordId || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 overflow-y-auto space-y-4 pr-1">
              {inspectLog.oldValue && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Previous State (Old Value)
                  </p>
                  <pre className="p-3 bg-slate-950 text-slate-100 rounded-lg text-xs overflow-x-auto border border-slate-800">
                    {JSON.stringify(inspectLog.oldValue, null, 2)}
                  </pre>
                </div>
              )}

              {inspectLog.newValue && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Updated / Created State (New Value)
                  </p>
                  <pre className="p-3 bg-slate-950 text-emerald-400 rounded-lg text-xs overflow-x-auto border border-slate-800">
                    {JSON.stringify(inspectLog.newValue, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-lg transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
