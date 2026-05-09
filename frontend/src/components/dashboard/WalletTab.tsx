'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, ArrowUpRight, Award, Check, Users, History } from 'lucide-react';
import api from '@/lib/api';

export default function WalletTab() {
  const [points, setPoints] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
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
        setReferralCode(user.referral_code || 'GSTW' + Math.random().toString(36).substring(2, 7).toUpperCase());
      } catch {}
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/api/dashboard/wallet');
      const data = res.data?.data || { balance: 0, totalReferrals: 0, earned: 0, pointsRedeemed: 0 };
      setPoints(data.balance);
      setStats({
        totalReferrals: data.totalReferrals || 0,
        earned: data.earned || 0,
        redeemed: data.pointsRedeemed || 0,
        balance: data.balance || 0
      });
      
      // Fetch history (tickets with category 'redemption')
      const ticketsRes = await api.get('/api/tickets');
      const redemptions = (ticketsRes.data?.data?.tickets || [])
        .filter((t: any) => t.category === 'redemption')
        .map((t: any) => ({
          id: t.id,
          type: 'debit',
          points: parseInt(t.description.match(/redeem (\d+) points/)?.[1] || '0'),
          reason: 'Redemption Request',
          desc: t.status.toUpperCase(),
          date: new Date(t.createdAt).toLocaleDateString()
        }));
        
      setHistory(redemptions);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (points < 200) {
      alert('Minimum 200 points required to redeem.');
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

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                disabled={points < 200}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${
                  points >= 200 
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

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
           <p className="text-sm font-medium text-gray-600 mb-4 text-center">Your Unique Referral Code</p>
           <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-2 pl-6 shadow-sm">
            <span className="font-mono font-black text-xl text-blue-600 flex-1 tracking-wider">{referralCode}</span>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-bold text-sm ${
                copied ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy Code</>}
            </button>
          </div>
          <div className="mt-6 flex gap-4 items-start bg-blue-50/50 p-4 rounded-xl border border-blue-100">
             <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">!</div>
             <p className="text-xs text-blue-800 leading-relaxed font-medium">
                Get <span className="font-bold">+200 points</span> instantly when your referred friend completes their first paid purchase. 
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
