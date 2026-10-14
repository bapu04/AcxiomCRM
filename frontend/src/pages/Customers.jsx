import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Building,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    status: 'Active',
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete modal state
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 8 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await axiosClient.get('/customers', { params });
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      companyName: '',
      address: '',
      city: '',
      state: '',
      status: 'Active',
      notes: '',
    });
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name || '',
      email: cust.email || '',
      phone: cust.phone || '',
      companyName: cust.companyName || '',
      address: cust.address || '',
      city: cust.city || '',
      state: cust.state || '',
      status: cust.status || 'Active',
      notes: cust.notes || '',
    });
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  // Client-side validations
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Customer Name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.phone)) {
      errors.phone = 'Enter a valid phone number (10 to 15 digits).';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) return;

    try {
      if (editingCustomer) {
        await axiosClient.put(`/customers/${editingCustomer._id}`, formData);
      } else {
        await axiosClient.post('/customers', formData);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          'Failed to save customer. Please check input values.'
      );
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      await axiosClient.delete(`/customers/${customerToDelete._id}`);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete customer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer Management
          </h1>
          <p className="text-sm text-slate-500">
            Maintain account master data, contact details, and assigned owners
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, phone, company, or code..."
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
            className="w-full md:w-44 py-2 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Lead">Lead</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-600 dark:text-slate-400 tracking-wider">
                <th className="py-3.5 px-4">Code / Customer</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">Company & Location</th>
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
                      Loading customers...
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/75 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {c.customerCode || 'CUST'}
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white mt-1">{c.name}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{c.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">{c.companyName || '—'}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {c.city ? `${c.city}${c.state ? `, ${c.state}` : ''}` : 'Location unlisted'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          c.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : c.status === 'Lead'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-900 dark:text-slate-200">
                        {c.assignedTo?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          title="Edit Customer"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {user?.role !== 'SalesExecutive' && (
                          <button
                            onClick={() => setCustomerToDelete(c)}
                            title="Delete Customer"
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter validated account details and contact attributes
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3.5 border border-red-200 flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-red-700">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCustomer} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Acme Corporation"
                    className={`mt-1 block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.name
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Acme Global Ltd"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Email Address * (Unique)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@domain.com"
                    className={`mt-1 block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.email
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Phone Number * (10-15 Digits)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+919876543210"
                    className={`mt-1 block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.phone
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-red-600 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Bengaluru"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Karnataka"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, building, suite..."
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Notes / Description
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional context about this customer relationship..."
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white rounded-lg transition"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!customerToDelete}
        title="Delete Customer Record"
        message={`Are you sure you want to delete customer '${customerToDelete?.name}'? This action will be recorded in the security audit log.`}
        confirmText="Delete Customer"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setCustomerToDelete(null)}
      />
    </div>
  );
};

export default Customers;
