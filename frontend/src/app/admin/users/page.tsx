'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Search, Trash2, Eye, Edit, Plus, Download, Shield, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';

export default function AdminUsersPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = adminAuth.getAdminToken();
      const user = adminAuth.getAdminUser();

      if (!token || user?.role !== 'admin') {
        router.push('/auth/login');
        return;
      }

      setAdminUser(user);
      fetchUsers();
    };

    checkAdmin();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');

      if (res.data.success) {
        const usersList = res.data.data?.users || res.data.users || [];
        setUsers(usersList);
        setFilteredUsers(usersList);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        (user.phone && user.phone.includes(query))
    );
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Permanently terminate this identity record?')) return;

    try {
      const res = await api.delete(`/api/admin/users/${userId}`);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Deletion error:', err);
    }
  };

  const handleExportUsers = async (type: 'csv' | 'excel') => {
    try {
      const endpoint = type === 'csv' ? '/api/admin/export/users' : '/api/admin/export/users-excel';
      const res = await api.get(endpoint, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `institutional_registry_${new Date().toISOString().split('T')[0]}.${type === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Identity Directory...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Identity Registry</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Monitoring platform identities, access vectors, and communication protocols</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExportUsers('csv')}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-900 hover:border-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
          >
            <Download size={14} />
            CSV Export
          </button>
          <button
            onClick={() => handleExportUsers('excel')}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-900 hover:border-slate-900 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
          >
            <Download size={14} />
            Excel Schema
          </button>
          <Link
            href="/admin/users/create"
            className="flex items-center gap-2.5 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg ml-2 active:scale-95"
          >
            <Plus size={14} />
            Initialize Registration
          </Link>
        </div>
      </div>

      {/* Directory Search & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        <div className="lg:col-span-3">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-all" size={18} />
            <input
              type="text"
              placeholder="Query directory by profile name, identity hash, or communication index..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:border-slate-900 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Total Registry Entities</p>
          <div className="flex items-baseline gap-2">
             <p className="text-3xl font-bold tracking-tight">{users.length}</p>
             <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Active Nodes</p>
          </div>
        </div>
      </div>

      {/* Identity Matrix */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] py-32 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <Users size={32} className="text-slate-200" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] max-w-[280px] leading-relaxed">No matching profile signatures identified in universal directory</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-1000">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-7 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Legal Identity & Hash</th>
                  <th className="px-6 py-7 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Profile Index</th>
                  <th className="px-6 py-7 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Comm. Terminal</th>
                  <th className="px-6 py-7 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Integrity Status</th>
                  <th className="px-6 py-7 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronization</th>
                  <th className="px-10 py-7 text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Governance</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-900 uppercase shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                           {user.name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900 tracking-tight">{user.name}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">ID: {user.id.substring(0, 12)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                       <span className="text-[11px] font-bold text-slate-600 tracking-tight">{user.email}</span>
                    </td>
                    <td className="px-6 py-6 font-mono text-[10px] font-bold text-slate-400 tracking-widest">
                       {user.phone || '—'}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl w-fit shadow-sm">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'active' ? 'bg-slate-900' : user.status === 'suspended' ? 'bg-red-500' : 'bg-slate-200'
                        }`} />
                        <span className="text-[9px] font-bold text-slate-900 uppercase tracking-widest">
                          {user.status || 'Active Node'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                         {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                       </p>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-xl transition-all" title="View Intelligence">
                          <Eye size={16} />
                        </button>
                        <button className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-xl transition-all" title="Update Profile">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Terminate Entity Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-16 text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">Identity Governance Protocol v4.0 • Registry Secure • Verified</p>
      </div>
    </div>
  );
}
