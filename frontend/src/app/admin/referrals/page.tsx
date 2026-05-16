'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { TrendingUp, Share2, Users, DollarSign, Mail, Search, CheckCircle, Phone, ArrowUpRight, Zap, Shield, Target } from 'lucide-react';

// --- Referral Verification Component ---
function ReferralVerification() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const token = adminAuth.getAdminToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/users?search=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const users = res.data.data?.users || res.data.users || [];
      const match = users.find((u: any) =>
        u.email?.toLowerCase() === query.toLowerCase() ||
        u.phone?.replace(/\D/g, '') === query.replace(/\D/g, '')
      );
      if (match) {
        setResult(match);
      } else if (users.length > 0) {
        setResult(users[0]);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <form onSubmit={handleVerify} className="flex gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setResult(null); setNotFound(false); }}
            placeholder="Query identity by mobile index or email profile..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-slate-900 outline-none transition-all text-sm font-bold text-slate-900 shadow-sm placeholder:text-slate-300"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest disabled:opacity-50 shadow-lg active:scale-95"
        >
          {loading ? 'Querying...' : 'Verify Identity'}
        </button>
      </form>

      {notFound && (
        <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-3 animate-in slide-in-from-top-4">
          <div className="p-2 bg-white rounded-lg text-red-600 shadow-sm">
             <Search size={16} />
          </div>
          <p className="font-bold text-[10px] uppercase tracking-widest text-red-900">
            Node mismatch: Zero entities resolved for <span className="underline">{query}</span>
          </p>
        </div>
      )}

      {result && (
        <div className="mt-6 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl animate-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center font-bold text-xl text-slate-900 shadow-inner">
                  {result.name?.charAt(0)}
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Resolved Entity</p>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{result.name}</h3>
               </div>
            </div>
            <div className="flex flex-wrap gap-3">
               <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{result.email}</span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                  <Phone size={14} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{result.phone || 'N/A'}</span>
               </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-slate-900 transition-all">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Affiliate Code</p>
              <p className="font-mono font-bold text-slate-900 text-xl tracking-widest">{result.referral_code || '—'}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-slate-900 transition-all">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Physical Reference</p>
              <p className="font-mono font-bold text-slate-900 text-xl tracking-widest">{result.reference_number || '—'}</p>
            </div>
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-900 shadow-2xl group hover:scale-[1.02] transition-all">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Liquidity Pool</p>
              <p className="font-bold text-white text-xl tracking-tight">{result.points_wallet || 0} <span className="text-[10px] text-slate-500 ml-1 uppercase tracking-widest">PTS</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Referrals Page ---
export default function AdminReferrals() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();
    if (!token || user?.role !== 'admin') {
      router.push('/admin');
      return;
    }
    loadReferrals();
    loadStats();
    const interval = setInterval(() => {
      loadReferrals();
      loadStats();
    }, 10000); // Toned down interval
    return () => clearInterval(interval);
  }, [router]);

  async function loadReferrals() {
    setRefreshing(true);
    try {
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/referrals`,
        config
      );
      setReferrals(res.data.data?.referrals || []);
    } catch (err) {
      console.error('Failed to load referrals', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/referrals-stats`,
        config
      );
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  }

  const filteredReferrals = filter === 'all'
    ? referrals
    : referrals.filter(r => r.referralStatus === filter);

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Affiliate Registry</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Strategic governance of referral ecosystems and commission architectures</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-slate-100 shadow-sm">
           <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-slate-900 animate-pulse' : 'bg-slate-200'}`} />
           <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{refreshing ? 'Synchronizing Data...' : 'Ledger Verified'}</p>
        </div>
      </div>

      {/* Referral Verification Tool */}
      <div className="mb-12 bg-slate-50 border border-slate-100 rounded-[2rem] p-10 shadow-inner relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-slate-200/20 rounded-full blur-3xl group-hover:bg-slate-200/40 transition-all duration-1000" />
        <div className="flex items-center gap-3 mb-8 relative">
           <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg">
              <Target size={18} />
           </div>
           <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Identity Verification Protocol</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Lookup institutional affiliate codes</p>
           </div>
        </div>
        <ReferralVerification />
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Network Reach', value: stats.totalReferrals || 0, icon: Users, color: 'text-slate-900' },
            { label: 'Settled Commission', value: `₹${Math.round(stats.totalCommission || 0).toLocaleString()}`, icon: DollarSign, color: 'text-slate-900' },
            { label: 'Active Protocols', value: stats.stats?.find((s: any) => s.referralStatus === 'completed')?._count?.id || 0, icon: Zap, color: 'text-slate-900' },
            { label: 'Pending Audits', value: stats.stats?.find((s: any) => s.referralStatus === 'pending')?._count?.id || 0, icon: Shield, color: 'text-slate-900' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
               <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                     <stat.icon size={18} />
                  </div>
                  <ArrowUpRight size={14} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
               </div>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
               <p className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter Section */}
      <div className="mb-8 flex items-center justify-between gap-6 flex-wrap">
         <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50 w-fit">
           {['all', 'pending', 'active', 'completed'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                 filter === f
                   ? 'bg-slate-900 text-white shadow-lg'
                   : 'text-slate-400 hover:text-slate-900 hover:bg-white'
               }`}
             >
               {f === 'all' ? 'Universal Ledger' : `${f} Nodes`}
             </button>
           ))}
         </div>
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
           Institutional Data Points: {filteredReferrals.length}
         </p>
      </div>

      {/* Referrals Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
           <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Affiliate Matrix...</p>
        </div>
      ) : filteredReferrals.length === 0 ? (
        <div className="text-center py-32 bg-slate-50/20 border-2 border-dashed border-slate-100 rounded-[2rem]">
           <Share2 size={32} className="text-slate-200 mx-auto mb-4" />
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Zero registered affiliate nodes detected</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden animate-in fade-in duration-1000">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Referrer Node</th>
                  <th className="px-6 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Referee Profile</th>
                  <th className="px-6 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Commission Matrix</th>
                  <th className="px-6 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Settled Amount</th>
                  <th className="px-6 py-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Protocol Status</th>
                  <th className="px-10 py-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredReferrals.map((referral: any) => (
                  <tr key={referral.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                             {referral.referrer?.name?.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900 text-sm tracking-tight">{referral.referrer?.name}</span>
                       </div>
                    </td>
                    <td className="px-6 py-6">
                       <div className="flex items-center gap-2.5">
                          <Mail size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight truncate max-w-[180px]">{referral.refereeEmail}</span>
                       </div>
                    </td>
                    <td className="px-6 py-6">
                       <span className="text-[10px] font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{referral.commissionPercent}% Index</span>
                    </td>
                    <td className="px-6 py-6">
                       <span className="text-[11px] font-bold text-slate-900 tracking-tight">₹{referral.commissionAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 w-fit mx-auto">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            referral.referralStatus === 'completed' ? 'bg-slate-900' : 
                            referral.referralStatus === 'active' ? 'bg-slate-400' : 'bg-slate-200'
                          }`} />
                          <span className="text-[9px] font-bold text-slate-900 uppercase tracking-widest">
                            {referral.referralStatus}
                          </span>
                       </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <Link 
                        href={`/admin/referrals/${referral.id}`} 
                        className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-900 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95 opacity-0 group-hover:opacity-100"
                      >
                        Engage Protocol
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-20 text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">Affiliate Governance • Protocol v4.28-STABLE • Verified</p>
      </div>
    </div>
  );
}
