import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import {
  CalendarCheck,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Phone,
  Video,
  Mail,
  CheckSquare,
} from 'lucide-react';

export const FollowUps = () => {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, today, upcoming, overdue
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    followUpType: 'Call',
    followUpDate: '',
    customerId: '',
    leadId: '',
    remarks: '',
  });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Complete follow-up modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [itemToComplete, setItemToComplete] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 8 };
      if (filterType !== 'all') params.filter = filterType;
      if (statusFilter) params.status = statusFilter;

      const res = await axiosClient.get('/followups', { params });
      setFollowUps(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load follow-ups', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedEntities = async () => {
    try {
      const [custRes, leadRes] = await Promise.all([
        axiosClient.get('/customers?limit=100'),
        axiosClient.get('/leads?limit=100'),
      ]);
      setCustomers(custRes.data.data);
      setLeads(leadRes.data.data);
    } catch (err) {
      console.error('Failed to load customers/leads dropdown', err);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [page, filterType, statusFilter]);

  useEffect(() => {
    fetchRelatedEntities();
  }, []);

  const openCreateModal = () => {
    // Default to tomorrow 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    setFormData({
      subject: '',
      followUpType: 'Call',
      followUpDate: dateStr,
      customerId: '',
      leadId: '',
      remarks: '',
    });
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.subject.trim()) errors.subject = 'Subject is required.';

    if (!formData.followUpDate) {
      errors.followUpDate = 'Follow-up date is required.';
    } else {
      const selected = new Date(formData.followUpDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Business Rule: Follow-up date cannot be earlier than today for planned follow-up
      if (selected < today) {
        errors.followUpDate = 'Follow-up date cannot be earlier than today.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveFollowUp = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) return;

    try {
      await axiosClient.post('/followups', {
        ...formData,
        customerId: formData.customerId || undefined,
        leadId: formData.leadId || undefined,
      });
      setIsModalOpen(false);
      fetchFollowUps();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          'Failed to schedule follow-up. Check input values.'
      );
    }
  };

  const handleCompleteFollowUp = async () => {
    if (!itemToComplete) return;
    try {
      await axiosClient.patch(`/followups/${itemToComplete._id}/complete`, {
        completedNotes: completionNotes,
      });
      setItemToComplete(null);
      setCompleteModalOpen(false);
      setCompletionNotes('');
      fetchFollowUps();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete follow-up.');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Meeting':
        return <Video className="h-4 w-4 text-purple-600" />;
      case 'Email':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'Task':
        return <CheckSquare className="h-4 w-4 text-amber-600" />;
      default:
        return <Phone className="h-4 w-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Follow-Up Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Schedule sales touchpoints, meetings, calls, and track completion
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          Schedule Follow-Up
        </button>
      </div>

      {/* Tabs / Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'today', label: "Today's Schedule" },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'overdue', label: 'Overdue' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterType(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-44 py-2 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="Completed">Completed</option>
            <option value="Missed">Missed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Follow-Ups Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-600 dark:text-slate-300 tracking-wider">
                <th className="py-3.5 px-4">Activity Type & Subject</th>
                <th className="py-3.5 px-4">Associated Entity</th>
                <th className="py-3.5 px-4">Scheduled Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                      Loading follow-ups...
                    </div>
                  </td>
                </tr>
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No follow-up activities found in this view.
                  </td>
                </tr>
              ) : (
                followUps.map((f) => {
                  const fDate = new Date(f.followUpDate);
                  const isOverdue = f.status === 'Planned' && fDate < new Date().setHours(0, 0, 0, 0);

                  return (
                    <tr key={f._id} className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {getTypeIcon(f.followUpType)}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{f.subject}</p>
                            {f.remarks && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{f.remarks}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {f.customerId ? (
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                              Customer
                            </span>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                              {f.customerId.name}
                            </p>
                          </div>
                        ) : f.leadId ? (
                          <div>
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                              Lead
                            </span>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                              {f.leadId.name}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">General</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${
                              isOverdue
                                ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold border border-red-200 dark:border-red-800'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {fDate.toLocaleDateString()}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400">
                              (Overdue)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            f.status === 'Completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : f.status === 'Planned'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {f.assignedTo?.name || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {f.status === 'Planned' && (
                          <button
                            onClick={() => {
                              setItemToComplete(f);
                              setCompleteModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800 transition"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Schedule Follow-Up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schedule CRM Follow-Up</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/50 p-3.5 border border-red-200 dark:border-red-800 flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-red-700 dark:text-red-300">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveFollowUp} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Subject / Objective *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Discuss commercial proposal revision"
                  className={`mt-1 block w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    fieldErrors.subject
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                  }`}
                />
                {fieldErrors.subject && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{fieldErrors.subject}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Activity Type
                  </label>
                  <select
                    value={formData.followUpType}
                    onChange={(e) => setFormData({ ...formData, followUpType: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Call">Phone Call</option>
                    <option value="Meeting">Meeting / Demo</option>
                    <option value="Email">Email Check-in</option>
                    <option value="Task">Task Item</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Follow-Up Date * (Cannot be in past)
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className={`mt-1 block w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      fieldErrors.followUpDate
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-400'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                    }`}
                  />
                  {fieldErrors.followUpDate && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{fieldErrors.followUpDate}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Link to Customer (Optional)
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None / Not linked to customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.customerCode || 'CUST'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Or Link to Lead (Optional)
                </label>
                <select
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None / Not linked to lead</option>
                  {leads.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name} ({l.leadCode || 'LEAD'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Remarks / Meeting Agenda
                </label>
                <textarea
                  rows="2"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Key discussion points, preparation notes..."
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white rounded-lg transition"
                >
                  Schedule Follow-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Follow-up Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mark Follow-Up as Completed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Subject: <span className="font-semibold text-slate-800 dark:text-slate-200">{itemToComplete?.subject}</span>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Outcome Notes / Summary
              </label>
              <textarea
                rows="3"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Summarize meeting conclusion, next steps, client feedback..."
                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteFollowUp}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white rounded-lg transition"
              >
                Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUps;
