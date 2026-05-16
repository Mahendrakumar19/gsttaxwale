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
  pincode: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  referenceNumber: string;
  referralCode: string;
  pan: string;
  aadhaar: string;
  dateOfBirth: string | null;
  doorNo: string;
  buildingName: string;
  street: string;
  area: string;
  address: string;
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
  const [newUser, setNewUser] = useState({ 
    name: '', email: '', phone: '', password: '', pan: '', 
    aadhaar: '', dateOfBirth: '', doorNo: '', buildingName: '', 
    street: '', area: '', city: '', state: '', pincode: '', referral_code: '' 
  });
  const [previewCode, setPreviewCode] = useState('');
  const [previewRef, setPreviewRef] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [resettingUser, setResettingUser] = useState<Customer | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
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
          pincode: user.pincode || '—',
          joinDate: user.createdAt || new Date().toISOString(),
          totalOrders: user.totalOrders || 0,
          totalSpent: user.totalSpent || 0,
          status: user.status === 'inactive' ? 'inactive' : 'active',
          referenceNumber: user.reference_number || user.referenceNumber || '—',
          referralCode: user.referral_code || user.referralCode || '—',
          pan: user.pan || '—',
          aadhaar: user.aadhaar || '—',
          dateOfBirth: user.dateOfBirth || null,
          doorNo: user.doorNo || '',
          buildingName: user.buildingName || '',
          street: user.street || '',
          area: user.area || '',
          address: user.address || ''
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

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setCreating(true);
    try {
      await api.put(`/api/admin/users/${editingCustomer.id}`, {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        pan: newUser.pan,
        aadhaar: newUser.aadhaar,
        doorNo: newUser.doorNo,
        buildingName: newUser.buildingName,
        street: newUser.street,
        area: newUser.area,
        city: newUser.city,
        state: newUser.state,
        pincode: newUser.pincode,
        referral_code: newUser.referral_code,
        status: editingCustomer.status
      });
      alert('User updated successfully');
      setShowEditModal(false);
      setEditingCustomer(null);
      setNewUser({ 
        name: '', email: '', phone: '', password: '', pan: '', 
        aadhaar: '', dateOfBirth: '', doorNo: '', buildingName: '', 
        street: '', area: '', city: '', state: '', pincode: '', referral_code: '' 
      });
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setCreating(false);
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
      setNewUser({ 
        name: '', email: '', phone: '', password: '', pan: '', 
        aadhaar: '', dateOfBirth: '', doorNo: '', buildingName: '', 
        street: '', area: '', city: '', state: '', pincode: '', referral_code: '' 
      });
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
    <div className="animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Management</h1>
          <p className="text-sm text-slate-500 mt-1">Review and manage registered customer accounts</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Download size={14} />
            Export Data
          </button>
          <button 
            onClick={() => router.push('/admin/customers/create')}
            className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={14} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
           <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center">
              <User size={20} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Total Records</p>
              <p className="text-xl font-bold text-slate-900">{customers.length}</p>
           </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
           <div className="w-10 h-10 bg-green-50 text-green-700 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Active Accounts</p>
              <p className="text-xl font-bold text-slate-900">{customers.filter((c) => c.status === 'active').length}</p>
           </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
           <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center">
              <Tag size={20} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Active Referrals</p>
              <p className="text-xl font-bold text-slate-900">{customers.filter((c) => c.referralCode && c.referralCode !== '—').length}</p>
           </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, identity, phone..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none transition"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none transition cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer Name</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Identification</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Referral</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="w-12 h-12 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">👥</div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">No Customers Found</h3>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center text-xs font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm leading-none">{customer.name}</p>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">ID: {customer.referenceNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <Mail size={12} className="text-slate-400" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Phone size={10} className="text-slate-300" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                           <span className="text-[10px] text-slate-400 uppercase">PAN:</span>
                           <span className="font-mono">{customer.pan}</span>
                        </div>
                        {customer.dateOfBirth && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                             <span>DOB:</span>
                             <span>{new Date(customer.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.referralCode && customer.referralCode !== '—' ? (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase tracking-wide">
                          {customer.referralCode}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${
                        customer.status === 'active'
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        {customer.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            setEditingCustomer(customer);
                            setNewUser({
                              name: customer.name,
                              email: customer.email,
                              phone: customer.phone || '',
                              pan: customer.pan || '',
                              aadhaar: customer.aadhaar || '',
                              doorNo: customer.doorNo || '',
                              buildingName: customer.buildingName || '',
                              street: customer.street || '',
                              area: customer.area || '',
                              city: customer.city || '',
                              state: customer.state || '',
                              pincode: customer.pincode || '',
                              referral_code: customer.referralCode || '',
                              password: '', 
                              dateOfBirth: customer.dateOfBirth || ''
                            });
                            setShowEditModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors" 
                          title="Edit Profile"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setResettingUser(customer);
                            setShowResetModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors" 
                          title="Reset Password"
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            Showing {paginatedCustomers.length} of {filteredCustomers.length} Records
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold uppercase tracking-wider text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredCustomers.length / itemsPerPage), p + 1))}
              disabled={currentPage * itemsPerPage >= filteredCustomers.length}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold uppercase tracking-wider text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* Referral Directory Summary */}
      <div className="mt-8">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Referral Directory</h2>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mobile</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Referral Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers
                  .filter((c) => c.referralCode && c.referralCode !== '—')
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{c.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono">{c.phone}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-bold">
                          {c.referralCode}
                        </span>
                      </td>
                    </tr>
                  ))}
                {customers.filter((c) => c.referralCode && c.referralCode !== '—').length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      No referral codes found
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add New Customer</h2>
                <p className="text-xs text-slate-500 mt-1">Register a new client profile in the database</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="e.g. Ram Kumar"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition font-semibold text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition font-semibold text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">PAN Number *</label>
                  <input
                    type="text"
                    value={newUser.pan}
                    onChange={(e) => setNewUser({ ...newUser, pan: e.target.value.toUpperCase() })}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition font-semibold text-sm uppercase"
                    required
                    maxLength={10}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newUser.dateOfBirth}
                    onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition font-semibold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. ram@example.com"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition font-semibold text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Password <span className="text-slate-400 font-medium lowercase italic">(leave blank to use mobile number)</span>
                </label>
                <input
                  type="text"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Default: mobile number"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition font-semibold text-sm"
                />
              </div>

              {/* Auto-generated fields preview */}
              {(previewCode || previewRef) && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">System Assignments</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Reference ID:</span>
                    <span className="font-mono text-sm text-slate-900 font-bold">{previewRef}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Referral Code:</span>
                    <span className="font-mono text-sm text-blue-700 font-bold">{previewCode}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-bold text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {creating ? 'Registering...' : 'Register Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && resettingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reset Password</h2>
              <button
                onClick={() => setShowResetModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-4">
                  Define a new security credential for <span className="font-bold text-slate-900">{resettingUser.name}</span>
                </p>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 block mb-1.5">New Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition font-semibold text-sm"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-bold text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading || !newPassword}
                  className="flex-1 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {resetLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/30">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Customer Profile</h2>
                <p className="text-xs text-slate-500 mt-1">Modify account details for {editingCustomer.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCustomer(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-8 space-y-8">
              {/* Section: Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition font-semibold text-sm text-slate-900"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition font-semibold text-sm text-slate-900"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                    <input
                      type="text"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition font-semibold text-sm text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Referral Code</label>
                    <input
                      type="text"
                      value={newUser.referral_code}
                      onChange={(e) => setNewUser({ ...newUser, referral_code: e.target.value })}
                      className="w-full px-4 py-2.5 bg-purple-50 border border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none transition font-bold text-sm text-purple-700 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Identification */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Identification</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">PAN Number</label>
                    <input
                      type="text"
                      value={newUser.pan}
                      onChange={(e) => setNewUser({ ...newUser, pan: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none transition font-semibold text-sm text-slate-900 uppercase"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Aadhaar Number</label>
                    <input
                      type="text"
                      value={newUser.aadhaar}
                      onChange={(e) => setNewUser({ ...newUser, aadhaar: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500/20 outline-none transition font-semibold text-sm text-slate-900"
                      maxLength={12}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Address */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Address Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Door / Flat No</label>
                    <input
                      type="text"
                      value={newUser.doorNo}
                      onChange={(e) => setNewUser({ ...newUser, doorNo: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition font-semibold text-sm text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Building Name</label>
                    <input
                      type="text"
                      value={newUser.buildingName}
                      onChange={(e) => setNewUser({ ...newUser, buildingName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition font-semibold text-sm text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Street</label>
                    <input
                      type="text"
                      value={newUser.street}
                      onChange={(e) => setNewUser({ ...newUser, street: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition font-semibold text-sm text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Area / Locality</label>
                    <input
                      type="text"
                      value={newUser.area}
                      onChange={(e) => setNewUser({ ...newUser, area: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition font-semibold text-sm text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">City</label>
                    <input
                      type="text"
                      value={newUser.city}
                      onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition font-semibold text-sm text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">State</label>
                    <input
                      type="text"
                      value={newUser.state}
                      onChange={(e) => setNewUser({ ...newUser, state: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition font-semibold text-sm text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Pincode</label>
                    <input
                      type="text"
                      value={newUser.pincode}
                      onChange={(e) => setNewUser({ ...newUser, pincode: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none transition font-semibold text-sm text-slate-900"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-bold text-xs uppercase tracking-wider"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-slate-900 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-slate-900/10 disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
