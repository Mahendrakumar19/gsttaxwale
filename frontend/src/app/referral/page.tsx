"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Share2, Copy, CheckCircle, Clock, TrendingUp, Mail, IndianRupee, ArrowRight, Wallet, X } from 'lucide-react';

export default function ReferralPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refereeEmail, setRefereeEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);
  const [token, setToken] = useState('');

  // Withdrawal Modal State
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

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
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/referrals`,
        config
      );
      setReferrals(res.data.data?.referrals || []);
      setStats({
        totalCommission: res.data.data?.totalCommission || 0,
        count: res.data.data?.count || 0,
        balance: res.data.data?.balance || 0
      });
      setWithdrawAmount(res.data.data?.balance || 0);
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
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/referrals`,
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

  async function handleWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    if (withdrawAmount < 500) return alert('Minimum withdrawal is ₹500');
    if (!payoutDetails) return alert('Please provide payout details');
    
    setWithdrawing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/referrals/redeem-points`,
        { 
          pointsToRedeem: withdrawAmount,
          payoutMethod,
          payoutDetails
        },
        config
      );
      alert('Withdrawal request submitted! Our team will process it within 7 business days.');
      setShowWithdraw(false);
      loadReferrals(token);
    } catch (err: any) {
      console.error('Withdrawal failed', err);
      alert(err.response?.data?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  }

  function copyToClipboard(text: string, type: 'link' | 'code') {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/contact?ref=${user?.referral_code || user?.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Share2 className="text-amber-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Referral Program</h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">Earn commissions by referring friends and businesses to GST Tax Wale. Your network is your net worth.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-500/30 rounded-xl p-8 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-amber-300 text-sm font-semibold uppercase tracking-wider">Wallet Balance</h3>
              <Wallet className="text-amber-400" size={24} />
            </div>
            <div className="text-4xl font-bold text-amber-400">₹{Math.round(stats?.balance || 0).toLocaleString()}</div>
            <button 
              onClick={() => setShowWithdraw(true)}
              className="mt-4 w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-2 rounded-lg transition text-sm flex items-center justify-center gap-2"
            >
              Withdraw Now
              <ArrowRight size={16} />
            </button>
            {/* Background Glow */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/30 rounded-xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-300 text-sm font-semibold uppercase tracking-wider">Successful Referrals</h3>
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <div className="text-4xl font-bold text-green-400">{referrals.filter(r => r.referralStatus === 'completed').length}</div>
            <p className="text-green-200/60 text-xs mt-2 font-medium">Earned 10% on every purchase</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-300 text-sm font-semibold uppercase tracking-wider">Total Earnings</h3>
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <div className="text-4xl font-bold text-blue-400">₹{Math.round(stats?.totalCommission || 0).toLocaleString()}</div>
            <p className="text-blue-200/60 text-xs mt-2 font-medium">Cumulative lifetime rewards</p>
          </div>
        </div>

        {/* Referral Link & Create New */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Share Link */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Share Your Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Your Referral Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 text-slate-300 break-all text-sm font-mono overflow-hidden flex items-center">
                    {referralLink}
                  </div>
                  <button
                    onClick={() => copyToClipboard(referralLink, 'link')}
                    className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition shrink-0"
                    title="Copy Link"
                  >
                    {copied === 'link' ? <CheckCircle size={20} className="text-green-400" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Your Referral Code</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-400 font-black text-2xl tracking-widest font-mono text-center flex items-center justify-center">
                    {user?.referral_code || '—'}
                  </div>
                  <button
                    onClick={() => copyToClipboard(user?.referral_code || '', 'code')}
                    className="p-3 bg-amber-500 hover:bg-amber-400 text-white rounded-lg transition shrink-0 flex items-center justify-center"
                    title="Copy Code"
                  >
                    {copied === 'code' ? <CheckCircle size={24} /> : <Copy size={24} />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-xs mt-6 leading-relaxed italic text-center">Share your link or code with friends to earn 10% commission on their purchases.</p>
          </div>

          {/* New Referral */}
          <form onSubmit={handleCreateReferral} className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Invite via Email</h2>
            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-semibold mb-2">Friend's Email Address</label>
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
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold py-4 rounded-lg hover:from-amber-500 hover:to-amber-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              {submitting ? 'Sending Invitation...' : 'Send Referral Invite'}
            </button>
            <p className="text-slate-400 text-xs mt-4 text-center">We'll send an invitation link to your friend on your behalf.</p>
          </form>
        </div>

        {/* Withdrawal Modal */}
        {showWithdraw && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-800 border border-slate-700 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
              <button 
                onClick={() => setShowWithdraw(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <IndianRupee className="text-amber-400" size={24} />
                  Withdraw Funds
                </h3>
                <p className="text-slate-400 text-sm">Submit your payout request. Min: ₹500.</p>
              </div>

              <form onSubmit={handleWithdrawal} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Amount to Withdraw</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-500 font-bold">₹</span>
                    <input 
                      type="number" 
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-900/50 border border-slate-600/30 rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-amber-500"
                      min="500"
                      max={stats?.balance}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 ml-1">Available: ₹{stats?.balance}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`py-3 rounded-xl font-bold text-sm border transition-all ${payoutMethod === 'upi' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-900/50 border-slate-600/30 text-slate-400'}`}
                  >
                    UPI ID
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPayoutMethod('bank')}
                    className={`py-3 rounded-xl font-bold text-sm border transition-all ${payoutMethod === 'bank' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-900/50 border-slate-600/30 text-slate-400'}`}
                  >
                    Bank Transfer
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {payoutMethod === 'upi' ? 'UPI ID (e.g. user@okaxis)' : 'Bank Details (Acc No + IFSC)'}
                  </label>
                  <textarea 
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    placeholder={payoutMethod === 'upi' ? "Enter your UPI ID" : "Enter Account Number, Bank Name, and IFSC Code"}
                    className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-600/30 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-amber-500 h-24 resize-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={withdrawing || (stats?.balance < 500)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                >
                  {withdrawing ? 'Processing Request...' : 'Submit Payout Request'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">How the Program Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Share Link', desc: 'Copy your referral link or share your code.' },
              { step: '2', title: 'Registration', desc: 'Your friend signs up using your link or code.' },
              { step: '3', title: 'Service Purchase', desc: 'They purchase any of our premium tax services.' },
              { step: '4', title: 'Earn Reward', desc: 'Get 10% commission (min ₹200) credited to your wallet.' }
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto mb-6 shadow-lg shadow-amber-500/20 transform rotate-3 hover:rotate-0 transition-transform">
                  {item.step}
                </div>
                <h3 className="text-white font-bold mb-3 text-lg">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-700/30 bg-slate-800/50 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Your Referral History</h2>
            <div className="px-4 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-widest">
              {referrals.length} Total
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center text-slate-400 flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading your network...</p>
            </div>
          ) : referrals.length === 0 ? (
            <div className="p-20 text-center text-slate-400">
              <Share2 size={48} className="mx-auto mb-4 text-slate-600 opacity-50" />
              <p className="text-lg font-medium">No referrals yet.</p>
              <p className="text-sm mt-1">Start sharing to build your network and earn commissions!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/30 bg-slate-900/50">
                    <th className="px-8 py-5 text-left text-slate-400 font-bold text-xs uppercase tracking-widest">Email</th>
                    <th className="px-8 py-5 text-left text-slate-400 font-bold text-xs uppercase tracking-widest">Commission</th>
                    <th className="px-8 py-5 text-left text-slate-400 font-bold text-xs uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-left text-slate-400 font-bold text-xs uppercase tracking-widest">Joined On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {referrals.map((ref: any) => (
                    <tr key={ref.id} className="hover:bg-slate-700/20 transition group">
                      <td className="px-8 py-5 text-white font-medium group-hover:text-amber-400 transition">{ref.refereeEmail}</td>
                      <td className="px-8 py-5">
                        <div className="text-green-400 font-bold">₹{ref.commissionAmount.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">10% RATE</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          ref.referralStatus === 'completed'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : ref.referralStatus === 'active'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {ref.referralStatus}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-slate-400 text-sm">{new Date(ref.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commission Terms */}
        <div className="mt-12 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="text-amber-500" size={20} />
            Program Rules & Terms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Commission Rate: 10% on all primary service purchases.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Minimum Reward: Guarantee of ₹200 per successful referral.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Validation: Referrals are valid for 90 days after registration.</span>
              </li>
            </ul>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Withdrawals: Request payout once your balance hits ₹500.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Payouts: Processed within 7 working days via Bank/UPI.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Support: Contact admin for manual verification issues.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
