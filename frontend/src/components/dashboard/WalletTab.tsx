'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, ArrowUpRight, Award, Check, Users, History } from 'lucide-react';
import api from '@/lib/api';

export default function WalletTab() {
  const [points, setPoints] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    earned: 0,
    redeemed: 0,
    balance: 0
  });

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // set a temporary referral code from session if available; prefer API result when fetched
        if (user.referral_code) setReferralCode(user.referral_code);
      } catch {}
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryResult, historyResult] = await Promise.allSettled([
        api.get('/api/dashboard/wallet'),
        api.get('/api/wallet/history'),
      ]);

        const summaryData = summaryResult.status === 'fulfilled'
            ? summaryResult.value.data?.data
            : null;

          // Prefer referral code from API (server source of truth) to keep it stable per user
          if (summaryData && summaryData.referralCode) {
            setReferralCode(summaryData.referralCode);
            // also sync to sessionStorage user object for other parts of the app
            try {
              const userData = sessionStorage.getItem('user');
              if (userData) {
                const user = JSON.parse(userData);
                user.referral_code = summaryData.referralCode;
                sessionStorage.setItem('user', JSON.stringify(user));
              }
            } catch (e) { /* ignore */ }
          }

          // If no referral code yet, try generating one via the same endpoint used by ContactForm
          const hasReferral = (summaryData && summaryData.referralCode) || (sessionStorage.getItem('user') && (() => { try { const u=JSON.parse(sessionStorage.getItem('user')||'{}'); return !!u.referral_code; } catch { return false; } })());
          if (!hasReferral) {
            try {
              const userData = sessionStorage.getItem('user');
              if (userData) {
                const user = JSON.parse(userData);
                const name = user.name || user.full_name || user.firstName || '';
                const email = user.email || user.emailAddress || '';
                const phone = user.phone || user.mobile || '0000000000';
                // Call backend to generate a public referral code for this user
                const genRes = await api.post('/api/referrals/generate-public', { name, email, phone });
                const genData = genRes?.data || {};
                const generatedCode = genData?.data?.referralCode || genData?.referralCode || genData?.data?.referral_code || genData?.referral_code;
                if (generatedCode) {
                  setReferralCode(generatedCode);
                  try {
                    user.referral_code = generatedCode;
                    sessionStorage.setItem('user', JSON.stringify(user));
                  } catch (e) { /* ignore */ }
                }
              }
            } catch (err) {
              // generation failed - non-fatal
              console.warn('Failed to auto-generate referral code', err);
            }
          }

      const historyData = historyResult.status === 'fulfilled'
        ? historyResult.value.data?.data
        : null;

      const balance = Number(summaryData?.balance || historyData?.balance || 0);
      setPoints(balance);
      setStats({
        totalReferrals: Number(summaryData?.totalReferrals || 0),
        earned: Number(summaryData?.earned || 0),
        redeemed: Number(summaryData?.pointsRedeemed || 0),
        balance,
      });

      const transactions = (historyData?.history || []).map((item: any) => ({
        id: item.id,
        type: item.type === 'credit' ? 'credit' : 'debit',
        points: Number(item.points || 0),
        reason: item.type === 'credit'
          ? 'Points Earned'
          : item.source === 'redemption'
            ? 'Redemption Request'
            : 'Points Deducted',
        desc: String(item.description || item.source || 'Transaction').toUpperCase(),
        date: new Date(item.created_at || item.createdAt || Date.now()).toLocaleDateString()
      }));

      setHistory(transactions);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (points < 100) {
      alert('Minimum 100 points required to redeem.');
      return;
    }
    
    if (!confirm(`Are you sure you want to redeem ${points} points? This will create a request for the admin team.`)) {
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/referrals/redeem-points', { pointsToRedeem: points });
      alert('Redemption request submitted successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const link = typeof window !== 'undefined' ? `${window.location.origin}/ref/${referralCode}` : '';
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading wallet...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Main Balance Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 opacity-80">
                <Award size={20} />
                <p className="text-sm font-bold uppercase tracking-widest">Wallet Balance</p>
              </div>
              <button 
                onClick={handleRedeem}
                disabled={points < 100}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${
                  points >= 100 
                      ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg shadow-black/20' 
                      : 'bg-white/20 text-white/40 cursor-not-allowed'
                }`}
              >
                Redeem Request
              </button>
            </div>
            <h3 className="text-5xl font-extrabold tracking-tight">{points.toLocaleString()} <span className="text-xl font-normal opacity-60">pts</span></h3>
            <div className="mt-6 flex items-center gap-4">
               <div className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-md">
                 <p className="text-[10px] uppercase font-bold opacity-60">Total Earned</p>
                 <p className="text-sm font-bold">{stats.earned}</p>
               </div>
               <div className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-md">
                 <p className="text-[10px] uppercase font-bold opacity-60">Redeemed</p>
                 <p className="text-sm font-bold">{stats.redeemed}</p>
               </div>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <Award size={200} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
             <Users size={24} />
           </div>
           <p className="text-3xl font-black text-gray-900">{stats.totalReferrals}</p>
           <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Total Referrals</p>
        </div>
      </div>

      {/* Referral Program Info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-lg flex items-center justify-center">
            <Gift size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Referral Program</h4>
            <p className="text-xs text-gray-500">Earn points for every successful referral</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Referral Code</p>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-2 pl-6 shadow-sm">
              <span className="font-mono font-black text-xl text-blue-600 flex-1 tracking-wider">{referralCode || '—'}</span>
              <button 
                type="button"
                onClick={handleCopyCode}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition font-bold text-xs ${
                  copiedCode ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {copiedCode ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Code</>}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Referral Link</p>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-2 pl-4 shadow-sm">
              <span className="font-mono text-xs text-gray-600 flex-1 truncate select-all pr-2">
                {typeof window !== 'undefined' ? `${window.location.origin}/ref/${referralCode}` : ''}
              </span>
              <button 
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition font-bold text-xs shrink-0 ${
                  copiedLink ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {copiedLink ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Link</>}
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-4 items-start bg-blue-50/50 p-4 rounded-xl border border-blue-100">
             <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">!</div>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
             Get <span className="font-bold">+100 points</span> instantly when your referred friend completes their first paid purchase. 
                Points can be redeemed for service discounts and expert consultations.
             </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <History size={18} className="text-gray-400" />
          <h4 className="font-bold text-gray-900">Points History</h4>
        </div>
        
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-blue-200 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    <ArrowUpRight size={20} className={item.type === 'debit' ? 'rotate-180' : ''} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.reason}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase">{item.desc} • {item.date}</p>
                  </div>
                </div>
                <p className={`font-black text-base ${item.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {item.type === 'credit' ? '+' : '-'}{item.points}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
             <p className="text-gray-400 text-sm font-medium">No activity yet. Start referring to earn points!</p>
          </div>
        )}
      </div>
    </div>
  );
}
