import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import {
  Target,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowRightLeft,
  DollarSign,
  Building,
  Phone,
  Mail,
  AlertCircle,
  X,
  CheckCircle,
} from 'lucide-react';

export const Leads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);

  // Lead Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    source: 'Website',
    status: 'New',
    priority: 'Medium',
    expectedValue: 0,
    notes: '',
  });
  const [formError, setFormError] = useState('');

  // Conversion Modal
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [convertData, setConvertData] = useState({
    createOpportunity: true,
    opportunityName: '',
    opportunityAmount: '',
    opportunityStage: 'Qualification',
    opportunityProbability: 25,
    expectedCloseDate: '',
  });
  const [convertError, setConvertError] = useState('');

  // Delete modal
  const [leadToDelete, setLeadToDelete] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 8 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await axiosClient.get('/leads', { params });
      setLeads(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const openCreateModal = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      companyName: '',
      source: 'Website',
      status: 'New',
      priority: 'Medium',
      expectedValue: 0,
      notes: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      companyName: lead.companyName || '',
      source: lead.source || 'Website',
      status: lead.status || 'New',
      priority: lead.priority || 'Medium',
      expectedValue: lead.expectedValue || 0,
      notes: lead.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      return setFormError('Lead Name is mandatory.');
    }

    try {
      if (editingLead) {
        await axiosClient.put(`/leads/${editingLead._id}`, formData);
      } else {
        await axiosClient.post('/leads', formData);
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save lead.');
    }
  };

  const openConvertModal = (lead) => {
    setLeadToConvert(lead);
    // Set 30 days ahead by default
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateString = futureDate.toISOString().split('T')[0];

    setConvertData({
      createOpportunity: true,
      opportunityName: `${lead.name} - Initial Deal`,
      opportunityAmount: lead.expectedValue || 50000,
      opportunityStage: 'Qualification',
      opportunityProbability: 25,
      expectedCloseDate: dateString,
    });
    setConvertError('');
    setConvertModalOpen(true);
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    setConvertError('');

    if (convertData.createOpportunity) {
      if (Number(convertData.opportunityAmount) <= 0) {
        return setConvertError('Opportunity Amount must be greater than 0.');
      }
      if (convertData.opportunityProbability < 0 || convertData.opportunityProbability > 100) {
        return setConvertError('Probability must be between 0 and 100.');
      }
    }

    try {
      await axiosClient.post(`/leads/${leadToConvert._id}/convert`, convertData);
      setConvertModalOpen(false);
      fetchLeads();
    } catch (err) {
      setConvertError(err.response?.data?.message || 'Failed to convert lead.');
    }
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;
    try {
      await axiosClient.delete(`/leads/${leadToDelete._id}`);
      setLeadToDelete(null);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete lead.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Qualified':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Converted':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Lost':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Lead Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Capture, nurture, and convert potential clients</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by lead name, company, code, or email..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-36 py-2 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Unqualified">Unqualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-36 py-2 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-600 dark:text-slate-300 tracking-wider">
                <th className="py-3.5 px-4">Code / Lead Name</th>
                <th className="py-3.5 px-4">Company & Source</th>
                <th className="py-3.5 px-4">Expected Value</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                      Loading leads...
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {l.leadCode || 'LEAD'}
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white mt-1">{l.name}</p>
                      {l.email && <p className="text-xs text-slate-500 dark:text-slate-400">{l.email}</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">{l.companyName || '—'}</p>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Source: {l.source}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ${Number(l.expectedValue || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          l.status === 'New'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : l.status === 'Contacted'
                            ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                            : l.status === 'Qualified'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : l.status === 'Converted'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            : l.status === 'Lost'
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          l.priority === 'High'
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                            : l.priority === 'Medium'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {l.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {l.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {l.status !== 'Converted' && (
                          <button
                            onClick={() => openConvertModal(l)}
                            title="Convert to Customer & Opportunity"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition border border-indigo-200 dark:border-indigo-800"
                          >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            Convert
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(l)}
                          title="Edit Lead"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {user?.role !== 'SalesExecutive' && (
                          <button
                            onClick={() => setLeadToDelete(l)}
                            title="Delete Lead"
                            className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Add / Edit Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingLead ? 'Edit Lead' : 'Add New Prospect Lead'}
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

            <form onSubmit={handleSaveLead} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Lead Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Horizon Marts"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="lead@company.com"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+919876543210"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Horizon Retail Ltd"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Lead Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Advertisement">Advertisement</option>
                    <option value="Partner">Partner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Unqualified">Unqualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Expected Value ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.expectedValue}
                    onChange={(e) => setFormData({ ...formData, expectedValue: Number(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Notes
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Lead background, customer pain points..."
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
                  {editingLead ? 'Save Changes' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Conversion Workflow Modal */}
      {convertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-800/60">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Convert Lead to Customer</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Lead: {leadToConvert?.name} ({leadToConvert?.leadCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConvertModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {convertError && (
              <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/50 p-3.5 border border-red-200 dark:border-red-800 flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-red-700 dark:text-red-300">{convertError}</span>
              </div>
            )}

            <form onSubmit={handleConvertLead} className="space-y-4 mt-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-800 dark:text-slate-100">Customer Account:</strong> A customer record will automatically be generated
                  and linked to this converted lead.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="createOpp"
                  checked={convertData.createOpportunity}
                  onChange={(e) =>
                    setConvertData({ ...convertData, createOpportunity: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="createOpp" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Create an initial Sales Opportunity simultaneously
                </label>
              </div>

              {convertData.createOpportunity && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Opportunity Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={convertData.opportunityName}
                      onChange={(e) =>
                        setConvertData({ ...convertData, opportunityName: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Deal Amount ($) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={convertData.opportunityAmount}
                        onChange={(e) =>
                          setConvertData({
                            ...convertData,
                            opportunityAmount: Number(e.target.value),
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Probability (0-100%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={convertData.opportunityProbability}
                        onChange={(e) =>
                          setConvertData({
                            ...convertData,
                            opportunityProbability: Number(e.target.value),
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Expected Close Date (Cannot be past)
                    </label>
                    <input
                      type="date"
                      required
                      value={convertData.expectedCloseDate}
                      onChange={(e) =>
                        setConvertData({ ...convertData, expectedCloseDate: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConvertModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white rounded-lg transition"
                >
                  Confirm Conversion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Lead Modal */}
      <ConfirmModal
        isOpen={!!leadToDelete}
        title="Delete Lead Record"
        message={`Are you sure you want to delete lead '${leadToDelete?.name}'?`}
        confirmText="Delete Lead"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setLeadToDelete(null)}
      />
    </div>
  );
};

export default Leads;
