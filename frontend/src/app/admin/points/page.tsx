'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wallet, Search, TrendingUp, TrendingDown } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  points_wallet: number;
}

interface PointsTransaction {
  id: string;
  type: 'credit' | 'debit';
  points: number;
  reason: string;
  description: string;
  createdAt: string;
}

export default function AdminPointsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const [adjustmentForm, setAdjustmentForm] = useState({
    pointsChange: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

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
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const response = await res.json();
        const usersList = response.data?.users || response.users || [];
        setUsers(usersList);
      } else {
        console.error('Failed to fetch users, status:', res.status);
        setUsers([]);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPointsHistory = async (userId: string, token: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/admin/points-history/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const response = await res.json();
        setPointsHistory(response.data?.history || []);
      } else {
        setPointsHistory([]);
      }
    } catch (err) {
      console.error('Failed to fetch points history:', err);
      setPointsHistory([]);
    }
  };

  const handleSelectUser = (user: User) => {
    const token = localStorage.getItem('token');
    setSelectedUser(user);
    setAdjustmentForm({ pointsChange: '', reason: '' });
    if (token) {
      fetchPointsHistory(user.id, token);
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || !adjustmentForm.pointsChange || !adjustmentForm.reason) {
      alert('Please fill in all fields');
      return;
    }

    const pointsChange = parseInt(adjustmentForm.pointsChange);
    if (isNaN(pointsChange) || pointsChange === 0) {
      alert('Points change must be a non-zero number');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const res = await fetch(`${baseUrl}/api/admin/points/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          pointsChange,
          reason: adjustmentForm.reason,
        }),
      });

      if (res.ok) {
        alert('Points adjusted successfully');
        fetchUsers(token!);
        const user = users.find((u) => u.id === selectedUser.id);
        if (user) {
          handleSelectUser(user);
        }
        setAdjustmentForm({ pointsChange: '', reason: '' });
      } else {
        const error = await res.json();
        alert(`Failed to adjust points: ${error.message}`);
      }
    } catch (err) {
      console.error('Adjustment error:', err);
      alert('An error occurred during adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchUsers = (query: string) => {
    setSearch(query);
    if (query.length < 2) {
      setSearching(false);
    } else {
      setSearching(true);
    }
  };

  const filteredUsers = search
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          (user.phone && user.phone.includes(search))
      )
    : [];

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!adminUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Wallet size={32} className="text-blue-600" />
            Points Management
          </h1>
          <p className="text-gray-600">Adjust user points and view history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Select User</h2>

              {/* Search Box */}
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search user..."
                  value={search}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* User List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searching && filteredUsers.length > 0
                  ? filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          handleSelectUser(user);
                          setSearch('');
                          setSearching(false);
                        }}
                        className="w-full text-left p-3 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition"
                      >
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {user.points_wallet} pts
                        </p>
                      </button>
                    ))
                  : searching && filteredUsers.length === 0 && (
                      <p className="text-gray-600 text-sm text-center py-4">No users found</p>
                    )}
              </div>

              {/* Selected User Info */}
              {selectedUser && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Selected User</p>
                  <p className="font-bold text-gray-900">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    {selectedUser.points_wallet} Points
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Adjustment & History Panel */}
          <div className="lg:col-span-2 space-y-6">
            {selectedUser ? (
              <>
                {/* Adjustment Form */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Adjust Points</h2>

                  <form onSubmit={handleAdjustPoints} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points Change (positive or negative)
                      </label>
                      <input
                        type="number"
                        value={adjustmentForm.pointsChange}
                        onChange={(e) =>
                          setAdjustmentForm({ ...adjustmentForm, pointsChange: e.target.value })
                        }
                        placeholder="e.g., 100 or -50"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <p className="text-xs text-gray-600 mt-1">Use positive for credit, negative for debit</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Adjustment
                      </label>
                      <input
                        type="text"
                        value={adjustmentForm.reason}
                        onChange={(e) =>
                          setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })
                        }
                        placeholder="e.g., Referral bonus, Service discount, etc."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-semibold"
                    >
                      {submitting ? 'Processing...' : 'Adjust Points'}
                    </button>
                  </form>
                </div>

                {/* Points History */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Points History</h2>

                  {pointsHistory.length > 0 ? (
                    <div className="space-y-3">
                      {pointsHistory.map((txn) => (
                        <div
                          key={txn.id}
                          className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">
                              {txn.type === 'credit' ? (
                                <TrendingUp className="text-green-600" size={20} />
                              ) : (
                                <TrendingDown className="text-red-600" size={20} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{txn.reason}</p>
                              <p className="text-sm text-gray-600">{txn.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(txn.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`font-bold text-lg whitespace-nowrap ml-4 ${
                              txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {txn.type === 'credit' ? '+' : '-'}
                            {txn.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No transaction history</p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-600 text-lg">Select a user to manage their points</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
