'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Search, Plus, Edit, Trash2, X, User, Phone, Mail, Hash, Tag, Download } from 'lucide-react';
import { adminAuth } from '@/lib/adminAuth';

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
}

function generateReferralCode(name: string, phone: string): string {
  const namePart = name.replace(/\s+/g, '').toLowerCase().slice(0, 3);
  const phonePart = phone.replace(/\D/g, '').slice(-3);
  return `gtw${namePart}${phonePart}`;
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
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '' });
  const [previewCode, setPreviewCode] = useState('');
  const [previewRef, setPreviewRef] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const adminToken = adminAuth.getAdminToken();
    const adminUser = adminAuth.getAdminUser();
    if (!adminToken || !adminUser || adminUser.role !== 'admin') {
      router.push('/admin/login');
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
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/admin/users`,
        config
      );
      const users = response.data.data?.users || [];
      setCustomers(
        users.map((user: any) => ({
          id: user.id,
          name: (user.firstName || '') + ' ' + (user.lastName || user.name || ''),
          email: user.email,
          phone: user.phone || 'N/A',
          city: user.city || 'N/A',
          state: user.state || 'N/A',
          joinDate: user.createdAt || new Date().toISOString(),
          totalOrders: user.totalOrders || 0,
          totalSpent: user.totalSpent || 0,
          status: user.isActive !== false ? 'active' : 'inactive',
          referenceNumber: user.reference_number || '—',
          referralCode: user.referral_code || '—',
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
        const token = adminAuth.getAdminToken();
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/users/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCustomers(customers.filter((c) => c.id !== id));
        alert('Customer deleted successfully');
      } catch (err) {
        console.error('Failed to delete customer:', err);
        alert('Failed to delete customer');
      }
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
        password: newUser.password || newUser.phone, // Default password = phone number
        referral_code: referralCode,
        reference_number: referenceNumber,
        created_by_admin: true,
        role: 'user',
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/users`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowCreateModal(false);
      setNewUser({ name: '', email: '', phone: '', password: '' });
      fetchCustomers();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create user. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const exportToExcel = () => {
    if (customers.length === 0) return;

    // Define CSV headers
    const headers = ['Name', 'Email', 'Phone', 'Reference Number', 'Referral Code', 'Join Date', 'Total Orders', 'Total Spent', 'Status'];
    
    // Map customer data to CSV rows
    const rows = customers.map(c => [
      c.name,
      c.email,
      c.phone,
      c.referenceNumber,
      c.referralCode,
      new Date(c.joinDate).toLocaleDateString(),
      c.totalOrders,
      c.totalSpent,
      c.status
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create a download link and trigger it
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-700 mt-1">Manage all registered customers</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Download size={20} />
              Export to Excel
            </button>
            <button
              onClick={() => { setShowCreateModal(true); setCreateError(''); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              Add Customer
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-xs relative">
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
      <div className="px-8 py-6 grid grid-cols-3 gap-4">
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
      <div className="px-8 py-2">
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email / Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ref. Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Referral Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                        <Edit size={16} />
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
      <div className="px-8 py-6">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
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
    </div>
  );
}
