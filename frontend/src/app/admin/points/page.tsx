'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wallet, Search, TrendingUp, TrendingDown, Loader2, User, History } from 'lucide-react';
import { adminAuth } from '@/lib/adminAuth';

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
      const token = adminAuth.getAdminToken();
      const user = adminAuth.getAdminUser();

      if (!token || user?.role !== 'admin') {
        router.push('/auth/login');
        return;
      }

      setAdminUser(user);
      fetchUsers(token);
    };

    checkAdmin();
  }, [router]);

  const fetchUsers = async (token: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
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
    const token = adminAuth.getAdminToken();
    setSelectedUser(user);
    setAdjustmentForm({ pointsChange: '', reason: '' });
    if (token) {
      fetchPointsHistory(user.id, token);
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || !adjustmentForm.pointsChange || !adjustmentForm.reason) {
      return;
    }

    const pointsChange = parseInt(adjustmentForm.pointsChange);
    if (isNaN(pointsChange) || pointsChange === 0) {
      return;
    }

    try {
      setSubmitting(true);
      const token = adminAuth.getAdminToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

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
        fetchUsers(token!);
        const updatedUser = users.find((u) => u.id === selectedUser.id);
        if (updatedUser) {
          handleSelectUser(updatedUser);
        }
        setAdjustmentForm({ pointsChange: '', reason: '' });
      }
    } catch (err) {
      console.error('Adjustment error:', err);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accessing Ledger Matrix...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Incentives</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Managing reward allocations and liquidity across the platform matrix</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* User Selection Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="mb-6">
               <h2 className="text-lg font-bold text-slate-900 tracking-tight">Identity Lookup</h2>
               <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-[0.2em]">Select recipient node</p>
            </div>

            {/* Search Box */}
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="text"
                placeholder="Search institutional ID..."
                value={search}
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300 shadow-sm"
              />
            </div>

            {/* User List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2">
              {searching && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      handleSelectUser(user);
                      setSearch('');
                      setSearching(false);
                    }}
                    className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-1">
                       <p className="font-bold text-slate-900 tracking-tight text-sm group-hover:translate-x-1 transition-transform">{user.name}</p>
                       <p className="text-[10px] font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{user.points_wallet} pts</p>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight truncate">{user.email}</p>
                  </button>
                ))
              ) : searching && filteredUsers.length === 0 ? (
                <div className="py-12 text-center">
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No matching nodes found</p>
                </div>
              ) : !selectedUser && (
                <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                   <User size={24} className="text-slate-200 mx-auto mb-3" />
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Awaiting Identity Query</p>
                </div>
              )}
            </div>

            {/* Selected User Info */}
            {selectedUser && (
              <div className="mt-8 p-6 bg-slate-900 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Engaged Node</p>
                <p className="font-bold text-white tracking-tight text-base mb-0.5">{selectedUser.name}</p>
                <p className="text-[10px] font-medium text-slate-400 truncate mb-4">{selectedUser.email}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Liquidity Index</p>
                   <p className="text-xl font-bold text-white tracking-tight">
                    {selectedUser.points_wallet} <span className="text-[10px] text-slate-500 ml-1 uppercase tracking-widest">PTS</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Adjustment & History Panel */}
        <div className="lg:col-span-2 space-y-10">
          {selectedUser ? (
            <>
              {/* Adjustment Form */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8">
                   <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                     <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl shadow-sm"><Wallet size={20} /></div>
                     Incentive Adjustment
                   </h2>
                   <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-[0.2em] ml-1">Modify liquidity allocation</p>
                </div>

                <form onSubmit={handleAdjustPoints} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Magnitude (Change)</label>
                    <input
                      type="number"
                      value={adjustmentForm.pointsChange}
                      onChange={(e) =>
                        setAdjustmentForm({ ...adjustmentForm, pointsChange: e.target.value })
                      }
                      placeholder="e.g. 500 (Credit) or -200 (Debit)"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                    />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1">Positive for credit • Negative for debit</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Operational Rationale</label>
                    <input
                      type="text"
                      value={adjustmentForm.reason}
                      onChange={(e) =>
                        setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })
                      }
                      placeholder="Institutional Adjustment Rationale..."
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !adjustmentForm.pointsChange || !adjustmentForm.reason}
                      className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-12 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 active:scale-95"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Commit Adjustment
                    </button>
                  </div>
                </form>
              </div>

              {/* Points History */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                   <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                     <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl shadow-sm"><History size={20} /></div>
                     Transaction Ledger
                   </h2>
                   <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-[0.2em] ml-1">Historical flow monitor</p>
                </div>

                {pointsHistory.length > 0 ? (
                  <div className="space-y-4">
                    {pointsHistory.map((txn) => (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-900 transition-all group"
                      >
                        <div className="flex items-center gap-6 flex-1">
                          <div className={`p-3 rounded-xl shadow-sm transition-all group-hover:scale-110 ${txn.type === 'credit' ? 'bg-white text-slate-900 border border-slate-100' : 'bg-slate-900 text-white shadow-xl'}`}>
                            {txn.type === 'credit' ? (
                              <TrendingUp size={18} />
                            ) : (
                              <TrendingDown size={18} />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 tracking-tight text-base mb-0.5">{txn.reason}</p>
                            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tight mb-2">{txn.description}</p>
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                 {new Date(txn.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                               </p>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`font-bold text-xl tracking-tight ml-6 ${
                            txn.type === 'credit' ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {txn.type === 'credit' ? '+' : '-'}{txn.points}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Zero registered movements in ledger</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-32 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
                 <Wallet size={32} className="text-slate-200" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] max-w-[280px] leading-relaxed">Engage identity node to access institutional liquidity protocols</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-20 text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">Liquidity Governance • v4.2-ACTIVE • STABLE</p>
      </div>
    </div>
  );
}
