'use client';

import { useState, useEffect } from 'react';
import { Link as LinkIcon, Copy, Share2, TrendingUp, Users } from 'lucide-react';
import api from '@/lib/api';

interface Referral {
  id: string;
  referralCode: string;
  referredUserName: string;
  referredUserEmail: string;
  status: 'pending' | 'completed' | 'earned';
  bonusAmount: number;
  createdAt: string;
}

export default function ReferralPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    completedReferrals: 0,
    totalEarnings: 0,
  });
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
    // Generate referral code (in real app, get from backend)
    setReferralCode(`REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await api.get('/api/referral/summary');
      setStats(response.data.stats || stats);
      setReferrals(response.data.referrals || []);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      // Mock data for demo
      setStats({
        totalReferrals: 5,
        activeReferrals: 2,
        completedReferrals: 3,
        totalEarnings: 15000,
      });
      setReferrals([
        {
          id: '1',
          referralCode: 'REF001',
          referredUserName: 'Rajesh Kumar',
          referredUserEmail: 'rajesh@example.com',
          status: 'completed',
          bonusAmount: 500,
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          referralCode: 'REF002',
          referredUserName: 'Priya Singh',
          referredUserEmail: 'priya@example.com',
          status: 'completed',
          bonusAmount: 500,
          createdAt: '2024-01-20',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/signup?ref=${referralCode}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎁</div>
          <h1 className="text-4xl font-bold text-white mb-2">Referral Bonus Program</h1>
          <p className="text-amber-300/80 text-lg">Earn rewards by referring friends to GST Tax Wale</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
          <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-500/30 rounded-lg p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <p className="text-amber-300 text-sm font-semibold">Total Referrals</p>
              <Users className="text-amber-400" size={24} />
            </div>
            <p className="text-3xl font-bold text-amber-400">{stats.totalReferrals}</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-lg p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-300 text-sm font-semibold">Active Referrals</p>
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.activeReferrals}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-lg p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-300 text-sm font-semibold">Completed Referrals</p>
              <LinkIcon className="text-blue-400" size={24} />
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.completedReferrals}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <p className="text-yellow-300 text-sm font-semibold">Total Earnings</p>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">₹{stats.totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-500/30 rounded-lg shadow-lg backdrop-blur p-8 mb-8">
          <h2 className="text-2xl font-bold text-amber-300 mb-6">📤 Share Your Referral Code</h2>

          <div className="space-y-4">
            {/* Referral Code */}
            <div>
              <label className="block text-sm font-semibold text-amber-300 mb-2">Your Referral Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-amber-500/30 rounded-lg text-white font-mono text-lg focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={handleCopyCode}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-lg hover:from-amber-700 hover:to-yellow-600 hover:shadow-lg hover:shadow-amber-600/40 transition font-semibold flex items-center gap-2"
                >
                  <Copy size={18} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <label className="block text-sm font-semibold text-amber-300 mb-2">Your Referral Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-amber-500/30 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 truncate"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:from-green-700 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-600/40 transition font-semibold flex items-center gap-2"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>

            {/* How It Works */}
            <div className="mt-6 pt-6 border-t border-amber-500/20">
              <h3 className="text-lg font-semibold text-amber-300 mb-3">How It Works</h3>
              <div className="space-y-2 text-amber-200/80 text-sm">
                <p>✓ Share your referral code with friends and family</p>
                <p>✓ They sign up using your code or link</p>
                <p>✓ Earn ₹500 bonus when they complete their first service purchase</p>
                <p>✓ Unlimited earning potential - refer as many people as you want!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/30 rounded-lg shadow-lg backdrop-blur">
          <div className="p-6 border-b border-slate-600/30">
            <h2 className="text-2xl font-bold text-white">Your Referrals</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-slate-400">Loading referrals...</div>
          ) : referrals.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <p>No referrals yet. Start sharing your code to earn bonuses!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-slate-600/30 bg-slate-900/30">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-amber-400">
                    Referred User
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-amber-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-amber-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-amber-400">
                    Bonus Amount
                  </th>
                  <th className="px-6 py-3 text-sm font-semibold text-left text-amber-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-slate-600/20 hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {referral.referredUserName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {referral.referredUserEmail}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          referral.status === 'completed'
                            ? 'bg-green-900/50 text-green-400 border-green-500/30'
                            : referral.status === 'earned'
                            ? 'bg-amber-900/50 text-amber-400 border-amber-500/30'
                            : 'bg-blue-900/50 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-green-400 font-bold">₹{referral.bonusAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
