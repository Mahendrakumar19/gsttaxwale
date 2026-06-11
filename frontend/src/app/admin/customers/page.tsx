'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Edit, Trash2, X, User, Phone, Mail, Hash, Tag, Download, Key } from 'lucide-react';
import { adminAuth } from '@/lib/adminAuth';
import api from '@/lib/api';
import * as XLSX from 'xlsx';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  referenceNumber: string;
  referralCode: string;
  pan: string;
  dateOfBirth: string | null;
}

function generateReferralCode(name: string, phone: string): string {
  const namePrefix = name.substring(0, 3).toUpperCase();
  const phonePrefix = phone ? phone.slice(-3) : '000';
  return `GTW${namePrefix}${phonePrefix}`;
}

function generateReferenceNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `GTW${timestamp}${rand}`;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', pan: '', dateOfBirth: '' });
  const [previewCode, setPreviewCode] = useState('');
  const [previewRef, setPreviewRef] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resettingUser, setResettingUser] = useState<Customer | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const adminToken = adminAuth.getAdminToken();
    const adminUser = adminAuth.getAdminUser();
    if (!adminToken || !adminUser || adminUser.role !== 'admin') {
      router.push('/auth/admin-login');
      return;
    }
    fetchCustomers();
  }, [router]);

  // Auto-preview referral code as admin types
  useEffect(() => {
    if (newUser.name && newUser.phone) {
      setPreviewCode(generateReferralCode(newUser.name, newUser.phone));
    } else {
      setPreviewCode('');
    }
    setPreviewRef(generateReferenceNumber());
  }, [newUser.name, newUser.phone]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      const users = response.data.data?.users || response.data.users || [];
      setCustomers(
        users.map((user: any) => ({
          id: user.id,
          name: user.name || ((user.firstName || '') + ' ' + (user.lastName || '')).trim() || 'Unnamed',
          email: user.email,
          phone: user.phone || 'N/A',
          city: user.city || 'N/A',
          state: user.state || 'N/A',
          joinDate: user.createdAt || new Date().toISOString(),
          totalOrders: user.totalOrders || 0,
          totalSpent: user.totalSpent || 0,
          status: user.status === 'inactive' ? 'inactive' : 'active',
          referenceNumber: user.reference_number || user.referenceNumber || '—',
          referralCode: user.referral_code || user.referralCode || '—',
          pan: user.pan || '—',
          dateOfBirth: user.dateOfBirth || null,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      customer.name.toLowerCase().includes(q) ||
      customer.email.toLowerCase().includes(q) ||
      customer.phone.includes(searchTerm) ||
      customer.referenceNumber.toLowerCase().includes(q) ||
      customer.referralCode.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/api/admin/users/${id}`);
        setCustomers(customers.filter((c) => c.id !== id));
        alert('Customer deleted successfully');
      } catch (err) {
        console.error('Failed to delete customer:', err);
        alert('Failed to delete customer');
      }
    }
  };

  const openEditModal = async (customer: Customer) => {
    setEditError('');
    // Fetch full user details to pre-populate all fields
    try {
      const res = await api.get(`/api/admin/customers/${customer.id}`);
      const u = res.data.data?.customer || customer;
      setEditingUser({
        id: customer.id,
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        pan: u.pan || '',
        aadhaar: u.aadhaar || '',
        dateOfBirth: u.dateOfBirth ? u.dateOfBirth.split('T')[0] : '',
        address: u.address || '',
        doorNo: u.doorNo || '',
        buildingName: u.buildingName || '',
        street: u.street || '',
        area: u.area || '',
        city: u.city || '',
        state: u.state || '',
        pincode: u.pincode || '',
        status: u.status || 'active',
        referral_code: u.referral_code || u.referralCode || '',
        role: u.role || 'user',
      });
    } catch {
      setEditingUser({
        id: customer.id,
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        pan: customer.pan || '',
        aadhaar: '',
        dateOfBirth: '',
        address: '',
        doorNo: '',
        buildingName: '',
        street: '',
        area: '',
        city: customer.city || '',
        state: customer.state || '',
        pincode: '',
        status: customer.status || 'active',
        referral_code: customer.referralCode || '',
        role: 'user',
      });
    }
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    setEditError('');
    try {
      await api.put(`/api/admin/users/${editingUser.id}`, editingUser);
      alert('Customer updated successfully!');
      setShowEditModal(false);
      setEditingUser(null);
      fetchCustomers();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setEditLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !newPassword) return;
    setResetLoading(true);
    try {
      await api.post(`/api/admin/users/${resettingUser.id}/reset-password`, { password: newPassword });
      alert('Password reset successfully');
      setShowResetModal(false);
      setNewPassword('');
      setResettingUser(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const token = adminAuth.getAdminToken();
      const referralCode = generateReferralCode(newUser.name, newUser.phone);
      const referenceNumber = generateReferenceNumber();

      const payload = {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        pan: newUser.pan,
        dateOfBirth: newUser.dateOfBirth,
        password: newUser.password || newUser.phone, // Default password = phone number
        referral_code: referralCode,
        reference_number: referenceNumber,
        created_by_admin: true,
        role: 'user',
      };

      await api.post('/api/admin/users', payload);

      setShowCreateModal(false);
      setNewUser({ name: '', email: '', phone: '', password: '', pan: '', dateOfBirth: '' });
      fetchCustomers();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create user. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const exportToExcel = () => {
    if (customers.length === 0) {
      alert('No customers to export');
      return;
    }

    // Prepare data for Excel
    const exportData = customers.map(c => ({
      'Name': c.name,
      'Email': c.email,
      'Phone': c.phone,
      'PAN': c.pan,
      'DOB': c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString('en-IN') : '—',
      'Reference Number': c.referenceNumber,
      'Referral Code': c.referralCode,
      'Join Date': new Date(c.joinDate).toLocaleDateString('en-IN'),
      'Total Orders': c.totalOrders,
      'Total Spent': c.totalSpent,
      'City': c.city,
      'State': c.state,
      'Status': c.status
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 12 }, // Phone
      { wch: 12 }, // PAN
      { wch: 12 }, // DOB
      { wch: 18 }, // Reference Number
      { wch: 15 }, // Referral Code
      { wch: 12 }, // Join Date
      { wch: 12 }, // Total Orders
      { wch: 12 }, // Total Spent
      { wch: 15 }, // City
      { wch: 15 }, // State
      { wch: 10 }  // Status
    ];
    worksheet['!cols'] = columnWidths;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `GST_Tax_Wale_Customers_${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="w-full min-w-0 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-700 mt-1 text-sm">Manage all registered customers</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export to Excel</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button 
              onClick={() => router.push('/admin/customers/create')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <Plus size={16} />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-0 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, ref no, or referral code..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-600 text-sm font-medium">Total Customers</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{customers.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 text-sm font-medium">Active</p>
          <p className="text-3xl font-bold text-green-900 mt-1">
            {customers.filter((c) => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-600 text-sm font-medium">With Referral Codes</p>
          <p className="text-3xl font-bold text-purple-900 mt-1">
            {customers.filter((c) => c.referralCode && c.referralCode !== '—').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email / Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ref. Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PAN Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DOB</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Referral Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={14} className="text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <Mail size={11} className="text-gray-400" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone size={11} className="text-gray-400" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Hash size={12} className="text-gray-400" />
                        <span className="text-sm font-mono text-gray-700">{customer.referenceNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-mono text-gray-700 font-bold">{customer.pan}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-700">
                          {customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString('en-IN') : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Tag size={12} className="text-purple-400" />
                        <span className="text-sm font-mono text-purple-700 font-medium">{customer.referralCode}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        customer.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 flex gap-1">
                      <button onClick={() => openEditModal(customer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setResettingUser(customer);
                          setShowResetModal(true);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded transition" 
                        title="Reset Password"
                      >
                        <Key size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-gray-700 text-sm">
            Showing {paginatedCustomers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredCustomers.length / itemsPerPage), p + 1))}
              disabled={currentPage * itemsPerPage >= filteredCustomers.length}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Referral Codes Summary Table */}
      <div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">📋 Referral Code Directory</h2>
          <p className="text-sm text-gray-600 mb-4">Quick reference: Name | Mobile | Referral Code</p>
          <div className="bg-white border border-purple-100 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-purple-50 border-b border-purple-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Mobile Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase">Referral Code</th>
                </tr>
              </thead>
              <tbody>
                {customers
                  .filter((c) => c.referralCode && c.referralCode !== '—')
                  .map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-purple-50/50 transition">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{c.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">{c.phone}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
                          {c.referralCode}
                        </span>
                      </td>
                    </tr>
                  ))}
                {customers.filter((c) => c.referralCode && c.referralCode !== '—').length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500 text-sm">
                      No referral codes assigned yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Customer</h2>
                <p className="text-sm text-gray-600 mt-0.5">Account credentials will be sent to the user</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Ram Kumar"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number *</label>
                <input
                  type="text"
                  value={newUser.pan}
                  onChange={(e) => setNewUser({ ...newUser, pan: e.target.value.toUpperCase() })}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={newUser.dateOfBirth}
                  onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. ram@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-gray-400 font-normal">(leave blank to use mobile number)</span>
                </label>
                <input
                  type="text"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Default: mobile number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              {/* Auto-generated fields preview */}
              {(previewCode || previewRef) && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Auto-generated</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Reference Number:</span>
                    <span className="font-mono text-sm text-gray-900 font-bold">{previewRef}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Referral Code:</span>
                    <span className="font-mono text-sm text-purple-800 font-bold">{previewCode}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reset Password Modal */}
      {showResetModal && resettingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
              <button onClick={() => setShowResetModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Set a new password for <span className="font-bold text-gray-900">{resettingUser.name}</span> ({resettingUser.email})
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">Cancel</button>
                <button type="submit" disabled={resetLoading || !newPassword} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50">
                  {resetLoading ? 'Resetting...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Customer</h2>
                <p className="text-sm text-gray-500 mt-0.5">Update all details for {editingUser.name}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-5">
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{editError}</div>
              )}

              {/* Personal Info */}
              <div>
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                    <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
                    <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number</label>
                    <input type="tel" value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                    <input type="date" value={editingUser.dateOfBirth} onChange={e => setEditingUser({...editingUser, dateOfBirth: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900" />
                  </div>
                </div>
              </div>

              {/* Tax Info */}
              <div>
                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">Tax & Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">PAN Number</label>
                    <input type="text" value={editingUser.pan} onChange={e => setEditingUser({...editingUser, pan: e.target.value.toUpperCase()})} maxLength={10} placeholder="ABCDE1234F" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 uppercase font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Aadhaar Number</label>
                    <input type="text" value={editingUser.aadhaar} onChange={e => setEditingUser({...editingUser, aadhaar: e.target.value})} maxLength={12} placeholder="12 digit Aadhaar" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 font-mono" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Door/Flat No.</label>
                    <input type="text" value={editingUser.doorNo} onChange={e => setEditingUser({...editingUser, doorNo: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Building Name</label>
                    <input type="text" value={editingUser.buildingName} onChange={e => setEditingUser({...editingUser, buildingName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Street</label>
                    <input type="text" value={editingUser.street} onChange={e => setEditingUser({...editingUser, street: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Area / Locality</label>
                    <input type="text" value={editingUser.area} onChange={e => setEditingUser({...editingUser, area: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                    <input type="text" value={editingUser.city} onChange={e => setEditingUser({...editingUser, city: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">State</label>
                    <input type="text" value={editingUser.state} onChange={e => setEditingUser({...editingUser, state: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Pincode</label>
                    <input type="text" value={editingUser.pincode} onChange={e => setEditingUser({...editingUser, pincode: e.target.value})} maxLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900" />
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div>
                <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3">Account Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                    <select value={editingUser.status} onChange={e => setEditingUser({...editingUser, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 bg-white">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Referral Code</label>
                    <input type="text" value={editingUser.referral_code} onChange={e => setEditingUser({...editingUser, referral_code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 font-mono uppercase" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold">Cancel</button>
                <button type="submit" disabled={editLoading} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold disabled:opacity-50">
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
