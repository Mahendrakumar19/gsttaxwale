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
    <div className="px-6 py-10 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-widest">User Directory</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Customer Database</h1>
          <p className="text-slate-500 font-medium mt-1">Manage registration records, identification, and loyalty codes</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-[1.5rem] font-black transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-[10px]"
          >
            <Download size={16} />
            Export Dataset
          </button>
          <button 
            onClick={() => router.push('/admin/customers/create')}
            className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-6 py-4 rounded-[1.5rem] font-black transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-[10px]"
          >
            <Plus size={16} />
            Register Customer
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm mb-12 flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, identity, phone, or reference..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
          className="px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-black uppercase tracking-widest text-[10px] focus:ring-4 focus:ring-blue-500/10 outline-none transition cursor-pointer"
        >
          <option value="all">Filter: All Status</option>
          <option value="active">Filter: Active</option>
          <option value="inactive">Filter: Inactive</option>
        </select>
      </div>

      {/* Quick Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <User size={28} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Users</p>
              <p className="text-3xl font-black text-slate-900">{customers.length}</p>
           </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Now</p>
              <p className="text-3xl font-black text-slate-900">{customers.filter((c) => c.status === 'active').length}</p>
           </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex items-center gap-6">
           <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Tag size={28} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Referral Tier</p>
              <p className="text-3xl font-black text-slate-900">{customers.filter((c) => c.referralCode && c.referralCode !== '—').length}</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identified Entity</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Communication Channel</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth / Identity</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Referral Engine</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity Status</th>
                <th className="text-right px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">👥</div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Registry Empty</h3>
                    <p className="text-slate-500 font-medium">No customer entities match the current filters</p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center text-blue-600 group-hover:rotate-6 transition-transform font-black">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-tight leading-none mb-1 uppercase text-sm">{customer.name}</p>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Ref: {customer.referenceNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Mail size={12} className="text-slate-400" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Phone size={10} className="text-slate-300" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PAN:</span>
                           <span className="text-xs font-black text-slate-900 font-mono tracking-tighter">{customer.pan}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DOB:</span>
                           <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Tag size={12} className="text-purple-400" />
                        <span className="text-xs font-black text-purple-700 font-mono uppercase tracking-tighter bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{customer.referralCode}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border w-fit ${
                        customer.status === 'active'
                          ? 'bg-green-50 border-green-100 text-green-700'
                          : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{customer.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                          className="p-3 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm border border-slate-100 transition active:scale-95" 
                          title="Modify Record"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setResettingUser(customer);
                            setShowResetModal(true);
                          }}
                          className="p-3 bg-white text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl shadow-sm border border-slate-100 transition active:scale-95" 
                          title="Auth Reset"
                        >
                          <Key size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-3 bg-white text-red-500 hover:bg-red-600 hover:text-white rounded-xl shadow-sm border border-slate-100 transition active:scale-95"
                          title="Purge Identity"
                        >
                          <Trash2 size={18} />
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
              <button
                onClick={() => setShowResetModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
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
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading || !newPassword}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50"
                >
                  {resetLoading ? 'Resetting...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Edit Customer Profile</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Modify comprehensive details for {editingCustomer.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCustomer(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-8 space-y-10">
              {/* Section: Basic Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">01</div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Personal Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-slate-900"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-slate-900"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input
                      type="text"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referral Code</label>
                    <input
                      type="text"
                      value={newUser.referral_code}
                      onChange={(e) => setNewUser({ ...newUser, referral_code: e.target.value })}
                      className="w-full px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-purple-900 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Identification */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center font-bold text-xs">02</div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Identification</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PAN Number</label>
                    <input
                      type="text"
                      value={newUser.pan}
                      onChange={(e) => setNewUser({ ...newUser, pan: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition font-bold text-slate-900 uppercase"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aadhaar Number</label>
                    <input
                      type="text"
                      value={newUser.aadhaar}
                      onChange={(e) => setNewUser({ ...newUser, aadhaar: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition font-bold text-slate-900"
                      maxLength={12}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Address */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold text-xs">03</div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Billing Address</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Door / Flat No</label>
                    <input
                      type="text"
                      value={newUser.doorNo}
                      onChange={(e) => setNewUser({ ...newUser, doorNo: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Building Name</label>
                    <input
                      type="text"
                      value={newUser.buildingName}
                      onChange={(e) => setNewUser({ ...newUser, buildingName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street</label>
                    <input
                      type="text"
                      value={newUser.street}
                      onChange={(e) => setNewUser({ ...newUser, street: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Area / Locality</label>
                    <input
                      type="text"
                      value={newUser.area}
                      onChange={(e) => setNewUser({ ...newUser, area: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                    <input
                      type="text"
                      value={newUser.city}
                      onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                    <input
                      type="text"
                      value={newUser.state}
                      onChange={(e) => setNewUser({ ...newUser, state: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                    <input
                      type="text"
                      value={newUser.pincode}
                      onChange={(e) => setNewUser({ ...newUser, pincode: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition font-bold text-slate-900"
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
                  className="flex-1 px-4 py-4 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition font-black uppercase tracking-widest text-xs"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl transition font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/10 disabled:opacity-50"
                >
                  {creating ? 'Processing...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
