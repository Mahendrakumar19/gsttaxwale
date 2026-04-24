'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Search, Trash2, Eye, Edit, Plus, Download } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          router.push('/auth/login');
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== 'admin') {
          router.push('/');
          return;
        }

        setAdminUser(user);
        fetchUsers(token);
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };

    checkAdmin();
  }, [router]);

  const fetchUsers = async (token: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (res.ok) {
        const response = await res.json();
        // Handle the nested response structure from backend: { success, message, data: { users: [...] } }
        const usersList = response.data?.users || response.users || [];
        setUsers(usersList);
        setFilteredUsers(usersList);
        console.log('Users fetched successfully:', usersList.length);
      } else {
        console.error('Failed to fetch users, status:', res.status);
        const error = await res.json().catch(() => ({}));
        console.error('Error response:', error);
        setUsers([]);
        setFilteredUsers([]);
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
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert('User deleted successfully');
        fetchUsers(token!);
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      alert('An error occurred');
    }
  };

  const handleExportUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/admin/export/users`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export users');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('An error occurred during export');
    }
  };

  const handleExportUsersExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/admin/export/users-excel`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `customers_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export users to Excel');
      }
    } catch (err) {
      console.error('Excel export error:', err);
      alert('An error occurred during Excel export');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!adminUser) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold text-blue-600 hover:text-blue-700">
            ← Admin Dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={32} className="text-blue-600" />
              Manage Users
            </h1>
            <p className="text-gray-900">Total Users: {users.length}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportUsers}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
              title="Export as CSV"
            >
              <Download size={20} />
              CSV
            </button>
            <button
              onClick={handleExportUsersExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              title="Export as Excel"
            >
              <Download size={20} />
              Excel
            </button>
            <Link
              href="/admin/users/create"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus size={20} />
              Create User
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-blue-600" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Users size={48} className="text-gray-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-900">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-gray-900 font-bold">Name</th>
                  <th className="px-6 py-3 text-left text-gray-900 font-bold">Email</th>
                  <th className="px-6 py-3 text-left text-gray-900 font-bold">Phone</th>
                  <th className="px-6 py-3 text-left text-gray-900 font-bold">Status</th>
                  <th className="px-6 py-3 text-left text-gray-900 font-bold">Joined</th>
                  <th className="px-6 py-3 text-center text-gray-900 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-2 divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="bg-white border border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-900 font-bold">{user.name}</td>
                    <td className="px-6 py-4 text-gray-900 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-gray-900">{user.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-900/30 text-green-300 text-sm font-bold rounded-full">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded transition text-blue-600" title="View">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded transition text-blue-600" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-slate-700/50 rounded transition text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
