"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Share2, Copy, CheckCircle, Clock, TrendingUp, Mail } from 'lucide-react';

export default function ReferralPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refereeEmail, setRefereeEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!authToken || !userData) {
      router.push('/auth/login');
      return;
    }

    setToken(authToken);
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    loadReferrals(authToken);
  }, [router]);

  async function loadReferrals(authToken: string) {
    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/referrals`,
        config
      );
      setReferrals(res.data.data?.referrals || []);
      setStats({
        totalCommission: res.data.data?.totalCommission || 0,
        count: res.data.data?.count || 0
      });
    } catch (err) {
      console.error('Failed to load referrals', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateReferral(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/referrals`,
        { refereeEmail },
        config
      );
      alert('Referral sent successfully! Share your unique link to earn commissions.');
      setRefereeEmail('');
      loadReferrals(token);
    } catch (err) {
      console.error('Failed to create referral', err);
      alert('Failed to create referral. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${user?.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="text-amber-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Referral Program</h1>
          </div>
          <p className="text-slate-300 text-lg">Earn commissions by referring friends and businesses to GST Tax Wale</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-500/30 rounded-xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-amber-300 text-sm font-semibold">Total Commission Earned</h3>
              <TrendingUp className="text-amber-400" size={24} />
            </div>
            <div className="text-4xl font-bold text-amber-400">â‚¹{Math.round(stats?.totalCommission || 0).toLocaleString()}</div>
            <p className="text-amber-200 text-sm mt-2">Ready to withdraw anytime</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/30 rounded-xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-300 text-sm font-semibold">Active Referrals</h3>
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <div className="text-4xl font-bold text-green-400">{referrals.filter(r => r.referralStatus === 'active' || r.referralStatus === 'completed').length}</div>
            <p className="text-green-200 text-sm mt-2">Successful conversions</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-300 text-sm font-semibold">Pending Referrals</h3>
              <Clock className="text-blue-400" size={24} />
            </div>
            <div className="text-4xl font-bold text-blue-400">{referrals.filter(r => r.referralStatus === 'pending').length}</div>
            <p className="text-blue-200 text-sm mt-2">Awaiting confirmation</p>
          </div>
        </div>

        {/* Referral Link & Create New */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Share Link */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Your Referral Link</h2>
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 mb-4">
              <div className="text-slate-300 break-all text-sm font-mono">{referralLink}</div>
            </div>
            <button
              onClick={() => copyToClipboard(referralLink)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold py-3 rounded-lg hover:from-amber-500 hover:to-amber-400 transition"
            >
              <Copy size={20} />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <p className="text-slate-400 text-sm mt-4">Share this link with friends to earn 10% commission on their purchases</p>
          </div>

          {/* New Referral */}
          <form onSubmit={handleCreateReferral} className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Refer via Email</h2>
            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-semibold mb-2">Email Address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={refereeEmail}
                  onChange={(e) => setRefereeEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="flex-1 bg-slate-900/50 border border-slate-600/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold py-3 rounded-lg hover:from-amber-500 hover:to-amber-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              {submitting ? 'Sending...' : 'Send Referral'}
            </button>
            <p className="text-slate-400 text-sm mt-4">Send an invitation link to your friend via email</p>
          </form>
        </div>

        {/* How It Works */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Share Link', desc: 'Share your referral link or email' },
              { step: '2', title: 'Friend Contacts Us', desc: 'They contact admin to create an account' },
              { step: '3', title: 'They Make Purchase', desc: 'They purchase any of our services' },
              { step: '4', title: 'You Earn', desc: '10% commission deposited to your account' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl overflow-hidden">
          <div className="p-8 border-b border-slate-700/30">
            <h2 className="text-2xl font-bold text-white">Your Referrals</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading referrals...</div>
          ) : referrals.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No referrals yet. Start sharing to earn!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/30 bg-slate-900/50">
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm">Email</th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm">Commission %</th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm">Earned</th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm">Status</th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref: any) => (
                    <tr key={ref.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                      <td className="px-6 py-4 text-white">{ref.refereeEmail}</td>
                      <td className="px-6 py-4 text-slate-300">{ref.commissionPercent}%</td>
                      <td className="px-6 py-4 text-green-400 font-semibold">â‚¹{ref.commissionAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ref.referralStatus === 'completed'
                            ? 'bg-green-900/30 text-green-400'
                            : ref.referralStatus === 'active'
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-yellow-900/30 text-yellow-400'
                        }`}>
                          {ref.referralStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{new Date(ref.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commission Terms */}
        <div className="mt-12 bg-blue-900/10 border border-blue-500/30 rounded-xl p-8">
          <h3 className="text-lg font-bold text-white mb-4">Commission Terms & Conditions</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>âœ“ Commission Rate: 10% on all referral purchases</li>
            <li>âœ“ Minimum Commission: â‚¹50 per referral</li>
            <li>âœ“ Payment: Processed monthly to registered bank account</li>
            <li>âœ“ Validation: Referral is valid for 30 days after sign-up</li>
            <li>âœ“ Withdrawal: Minimum â‚¹500 to initiate withdrawal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
