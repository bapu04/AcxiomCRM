import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import {
  TrendingUp,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  Calendar,
  Building,
  AlertCircle,
  X,
  Percent,
} from 'lucide-react';

export const Opportunities = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    customerId: '',
    amount: '',
    stage: 'Qualification',
    probability: 20,
    expectedCloseDate: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete modal
  const [oppToDelete, setOppToDelete] = useState(null);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 8 };
      if (search) params.search = search;
      if (stageFilter) params.stage = stageFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await axiosClient.get('/opportunities', { params });
      setOpportunities(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load opportunities', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersList = async () => {
    try {
      const res = await axiosClient.get('/customers?limit=100');
      setCustomers(res.data.data);
    } catch (err) {
      console.error('Failed to load customer dropdown', err);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchCustomersList();
  }, [page, stageFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOpportunities();
  };

  const openCreateModal = () => {
    setEditingOpp(null);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().split('T')[0];

    setFormData({
      name: '',
      customerId: customers[0]?._id || '',
      amount: '',
      stage: 'Qualification',
      probability: 20,
      expectedCloseDate: dateStr,
      notes: '',
    });
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (opp) => {
    setEditingOpp(opp);
    const formattedDate = opp.expectedCloseDate
      ? new Date(opp.expectedCloseDate).toISOString().split('T')[0]
      : '';

    setFormData({
      name: opp.name || '',
      customerId: opp.customerId?._id || opp.customerId || '',
      amount: opp.amount || '',
      stage: opp.stage || 'Qualification',
      probability: opp.probability ?? 20,
      expectedCloseDate: formattedDate,
      notes: opp.notes || '',
    });
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  // Stage change auto-adjusts probability
  const handleStageChange = (e) => {
    const stage = e.target.value;
    let prob = formData.probability;
    if (stage === 'Qualification') prob = 20;
    if (stage === 'Proposal') prob = 50;
    if (stage === 'Negotiation') prob = 80;
    if (stage === 'Won') prob = 100;
    if (stage === 'Lost') prob = 0;

    setFormData({ ...formData, stage, probability: prob });
  };

  // Client-side Business Validations
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Opportunity Name is required.';
    if (!formData.customerId) errors.customerId = 'Associated Customer is required.';

    if (!formData.amount || Number(formData.amount) <= 0) {
      errors.amount = 'Opportunity Amount must be greater than 0.';
    }

    if (formData.probability < 0 || formData.probability > 100) {
      errors.probability = 'Probability must be between 0 and 100.';
    }

    if (!formData.expectedCloseDate) {
      errors.expectedCloseDate = 'Expected Close Date is required.';
    } else {
      const selected = new Date(formData.expectedCloseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Business Rule: Expected close date cannot be in past for active opportunities
      if (['Qualification', 'Proposal', 'Negotiation'].includes(formData.stage) && selected < today) {
        errors.expectedCloseDate = 'Expected Close Date cannot be in the past.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveOpportunity = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) return;

    try {
      if (editingOpp) {
        await axiosClient.put(`/opportunities/${editingOpp._id}`, formData);
      } else {
        await axiosClient.post('/opportunities', formData);
      }
      setIsModalOpen(false);
      fetchOpportunities();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          'Failed to save opportunity. Please check validation rules.'
      );
    }
  };

  const handleDelete = async () => {
    if (!oppToDelete) return;
    try {
      await axiosClient.delete(`/opportunities/${oppToDelete._id}`);
      setOppToDelete(null);
      fetchOpportunities();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete opportunity.');
    }
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'Qualification':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Proposal':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Negotiation':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Won':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Lost':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const calculateWeighted = (amount, prob) => {
    if (!amount || prob == null) return 0;
    return Math.round((Number(amount) * Number(prob)) / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Opportunity Pipeline</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track deal stages, values, probabilities, and weighted forecasts
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          Add Opportunity
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by opportunity name or code..."
            className="w-full pl-9 pr-24 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold rounded text-slate-700 dark:text-slate-200 transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={stageFilter}
            onChange={(e) => {
              setStageFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-40 py-2 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Stages</option>
            <option value="Qualification">Qualification</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-36 py-2 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-600 dark:text-slate-300 tracking-wider">
                <th className="py-3.5 px-4">Code / Deal Name</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4">Deal Amount</th>
                <th className="py-3.5 px-4">Probability / Weighted</th>
                <th className="py-3.5 px-4">Expected Close</th>
                <th className="py-3.5 px-4">Owner</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                      Loading pipeline...
                    </div>
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No opportunities found matching your filters.
                  </td>
                </tr>
              ) : (
                opportunities.map((opp) => {
                  const weighted = calculateWeighted(opp.amount, opp.probability);
                  return (
                    <tr key={opp._id} className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {opp.opportunityCode || 'OPP'}
                        </span>
                        <p className="font-semibold text-slate-900 dark:text-white mt-1">{opp.name}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                          {opp.customerId?.name || 'Unknown Customer'}
                        </p>
                        {opp.customerId?.companyName && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {opp.customerId.companyName}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            opp.stage === 'Qualification'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : opp.stage === 'Proposal'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : opp.stage === 'Negotiation'
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              : opp.stage === 'Won'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : opp.stage === 'Lost'
                              ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {opp.stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ${Number(opp.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {opp.probability}%
                          </span>
                          <span className="text-xs text-slate-400">|</span>
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            ${weighted.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              opp.stage === 'Won'
                                ? 'bg-emerald-500'
                                : opp.stage === 'Lost'
                                ? 'bg-red-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${opp.probability}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {opp.expectedCloseDate
                          ? new Date(opp.expectedCloseDate).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {opp.assignedTo?.name || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(opp)}
                            title="Edit Deal"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {user?.role !== 'SalesExecutive' && (
                            <button
                              onClick={() => setOppToDelete(opp)}
                              title="Delete Deal"
                              className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
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

      {/* Create / Edit Opportunity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto transition-colors duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingOpp ? 'Edit Opportunity' : 'Add New Sales Deal'}
              </h3>
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

            <form onSubmit={handleSaveOpportunity} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Opportunity Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Enterprise Cloud Renewal"
                  className={`mt-1 block w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    fieldErrors.name
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-400'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Associated Customer *
                </label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.customerCode || 'CUST'}) - {c.companyName || 'No Company'}
                    </option>
                  ))}
                </select>
                {fieldErrors.customerId && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{fieldErrors.customerId}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Deal Amount ($) * (Must be &gt; 0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 50000"
                    className={`mt-1 block w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      fieldErrors.amount
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-400'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                    }`}
                  />
                  {fieldErrors.amount && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{fieldErrors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Pipeline Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={handleStageChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Qualification">Qualification (20%)</option>
                    <option value="Proposal">Proposal (50%)</option>
                    <option value="Negotiation">Negotiation (80%)</option>
                    <option value="Won">Won (100%)</option>
                    <option value="Lost">Lost (0%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Probability ({formData.probability}%)
                    </label>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      Weighted: $
                      {calculateWeighted(formData.amount, formData.probability).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) =>
                      setFormData({ ...formData, probability: Number(e.target.value) })
                    }
                    className="mt-2 block w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  {fieldErrors.probability && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{fieldErrors.probability}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Expected Close Date * (Cannot be past)
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expectedCloseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedCloseDate: e.target.value })
                    }
                    className={`mt-1 block w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      fieldErrors.expectedCloseDate
                        ? 'border-red-300 dark:border-red-700 focus:ring-red-400'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                    }`}
                  />
                  {fieldErrors.expectedCloseDate && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{fieldErrors.expectedCloseDate}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Deal Notes & Milestones
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key stakeholders, competitive positioning, next milestones..."
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
                  {editingOpp ? 'Save Changes' : 'Create Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!oppToDelete}
        title="Delete Opportunity"
        message={`Are you sure you want to delete '${oppToDelete?.name}'?`}
        confirmText="Delete Deal"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setOppToDelete(null)}
      />
    </div>
  );
};

export default Opportunities;
