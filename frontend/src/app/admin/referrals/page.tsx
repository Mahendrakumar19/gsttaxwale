"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { 
  TrendingUp, Share2, Users, DollarSign, Mail, Search, 
  CheckCircle, Phone, UserCheck, CheckCircle2, RefreshCw, X 
} from 'lucide-react';
import { toast } from 'sonner';

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
      // Match by email or phone
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
    <div>
      <form onSubmit={handleVerify} className="flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setResult(null); setNotFound(false); }}
            placeholder="Enter mobile number or email address..."
            className="w-full pl-10 pr-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Verify'}
        </button>
      </form>

      {notFound && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          No customer found with mobile: <strong>{query}</strong> or email: <strong>{query}</strong>
        </div>
      )}

      {result && (
        <div className="mt-4 bg-white border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-lg">{result.name}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div className="flex items-center gap-1 text-gray-600"><Mail size={14} /> {result.email}</div>
                <div className="flex items-center gap-1 text-gray-600"><Phone size={14} /> {result.phone || 'N/A'}</div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="bg-purple-100 rounded-lg px-4 py-2">
                  <p className="text-xs text-purple-600 font-medium">Referral Code</p>
                  <p className="font-mono font-bold text-purple-800 text-lg">{result.referral_code || '—'}</p>
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-600 font-medium">Reference Number</p>
                  <p className="font-mono font-bold text-gray-800">{result.reference_number || '—'}</p>
                </div>
                <div className="bg-blue-100 rounded-lg px-4 py-2">
                  <p className="text-xs text-blue-600 font-medium">Points Wallet</p>
                  <p className="font-bold text-blue-800 text-lg">{result.points_wallet || 0} pts</p>
                </div>
              </div>
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
  
  // Conversion Credentials state
  const [credentials, setCredentials] = useState<any>(null);

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
    }, 5000);
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

  const handleConvertLead = async (leadId: number) => {
    if (!window.confirm('Are you sure you want to convert this referral lead into an active Customer? This will auto-create their login credentials.')) {
      return;
    }
    try {
      const token = adminAuth.getAdminToken();
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/referral-leads/${leadId}/convert`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success('Lead converted to Customer successfully!');
        setCredentials(res.data.data);
        loadReferrals();
        loadStats();
      }
    } catch (err: any) {
      console.error('Conversion failed:', err);
      toast.error(err.response?.data?.message || 'Failed to convert lead to customer');
    }
  };

  const filteredReferrals = filter === 'all'
    ? referrals
    : referrals.filter(r => r.referralStatus === filter);

  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-blue-600" size={28} />
              <h1 className="text-3xl font-bold text-black font-black">Referrals & Leads Dashboard</h1>
            </div>
            <p className="text-gray-600">Track, verify, and convert guest leads, and manage rewards/commissions from one unified system.</p>
          </div>
          <button 
            onClick={() => { loadReferrals(); loadStats(); }}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 border border-gray-200 rounded-xl transition shadow-sm text-sm"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Referral Verification Tool */}
        <div className="mb-8 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">🔍 Verify Referral by Mobile / Email</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter customer mobile number or email to look up their referral code and verify referrals
          </p>
          <ReferralVerification />
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalReferrals || 0}</div>
              <div className="text-gray-600 text-sm">Total Referrals</div>
            </div>
            <div className="bg-green-50 border border-green-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">₹{Math.round(stats.totalCommission || 0).toLocaleString()}</div>
              <div className="text-gray-600 text-sm">Total Commission Paid</div>
            </div>
            <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.stats?.find((s: any) => s.referralStatus === 'completed')?._count?.id || 0}
              </div>
              <div className="text-gray-600 text-sm">Completed</div>
            </div>
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {stats.stats?.find((s: any) => s.referralStatus === 'pending')?._count?.id || 0}
              </div>
              <div className="text-gray-600 text-sm">Pending</div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'pending', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              {f === 'all' ? 'All Referrals & Leads' : f}
            </button>
          ))}
        </div>

        {/* Referrals Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading referrals...</div>
        ) : filteredReferrals.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No referrals found</div>
        ) : (
          <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <th className="px-6 py-4 text-left text-gray-900 font-bold text-sm">Referrer</th>
                    <th className="px-6 py-4 text-left text-gray-900 font-bold text-sm">Referee / Referred Guest</th>
                    <th className="px-6 py-4 text-left text-gray-900 font-bold text-sm">Contact Details</th>
                    <th className="px-6 py-4 text-left text-gray-900 font-bold text-sm">Commission Info</th>
                    <th className="px-6 py-4 text-left text-gray-900 font-bold text-sm">Status</th>
                    <th className="px-6 py-4 text-center text-gray-900 font-bold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map((referral: any) => (
                    <tr key={referral.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-black">{referral.referrerName}</div>
                        <div className="text-xs text-gray-500">{referral.referrer?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-black">{referral.referredName}</div>
                        {referral.serviceInterest && (
                          <div className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-1 font-medium border border-purple-100">
                            Interest: {referral.serviceInterest}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail size={13} className="text-gray-400" />
                          <span>{referral.refereeEmail || 'N/A'}</span>
                        </div>
                        {referral.refereePhone && (
                          <div className="flex items-center gap-1 text-gray-600 mt-1">
                            <Phone size={13} className="text-gray-400" />
                            <span>{referral.refereePhone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-black">₹{referral.commissionAmount?.toLocaleString() || 0}</div>
                        <div className="text-xs text-gray-500">Rate: {referral.commissionPercent}%</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          referral.referralStatus === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : referral.referralStatus === 'active'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {referral.referralStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {referral.referralStatus === 'pending' && referral.leadId && (
                            <button
                              onClick={() => handleConvertLead(referral.leadId)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-750 text-white rounded-lg text-xs font-bold transition shadow-sm hover:shadow-md"
                            >
                              <UserCheck size={14} />
                              Convert to Customer
                            </button>
                          )}
                          <Link 
                            href={`/admin/referrals/${referral.id}`} 
                            className="text-blue-600 hover:text-blue-800 transition font-semibold text-xs border border-gray-300 hover:border-blue-400 bg-white rounded-lg px-2.5 py-1.5"
                          >
                            Manage
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="mt-6 text-slate-400 text-sm">
            Showing {filteredReferrals.length} of {referrals.length} referrals
          </div>
        )}
      </div>

      {/* Credentials / Conversion Success Modal */}
      {credentials && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative overflow-hidden text-center animate-in fade-in zoom-in duration-200">
            <CheckCircle2 className="mx-auto text-green-500 mb-4 animate-bounce" size={64} />
            
            <h3 className="text-2xl font-black text-gray-900 mb-2">Lead Converted!</h3>
            <p className="text-gray-500 text-sm mb-6">The user account has been successfully created. Onboarding credentials have been generated:</p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left font-mono text-sm space-y-2 mb-6">
              <div>
                <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider font-sans">Login Email</span>
                <span className="font-bold text-gray-800 select-all">{credentials.email}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider font-sans">Temporary Password</span>
                <span className="font-bold text-blue-600 select-all">{credentials.password}</span>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              An email notification has been dispatched to <span className="font-semibold text-gray-600">{credentials.email}</span> with these credentials and a link to log in.
            </p>

            <button 
              onClick={() => setCredentials(null)}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition uppercase tracking-wider text-xs"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
