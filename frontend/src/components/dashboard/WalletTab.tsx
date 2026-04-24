'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, ArrowUpRight, Award, Check } from 'lucide-react';
import api from '@/lib/api';

export default function WalletTab() {
  const [points, setPoints] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      setPoints(res.data?.wallet?.balance || 5000);
      setHistory(res.data?.transactions || [
        { id: '1', type: 'credit', points: 2500, reason: 'Referral', desc: 'Shyam Singh', date: '2026-04-20' },
        { id: '2', type: 'debit', points: 1000, reason: 'Service', desc: 'GSTR-3B Filing', date: '2026-04-15' },
      ]);
    } catch {
      setPoints(5000); // Mock
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
    <div className="max-w-xl mx-auto space-y-5">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Award size={18} className="text-blue-100" />
            <p className="text-sm font-medium text-blue-100">Available Points</p>
          </div>
          <h3 className="text-4xl font-bold">{points.toLocaleString()}</h3>
          <p className="text-xs text-blue-100/70 mt-2">10 Points = ₹1.00 (Service Credit)</p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Award size={120} />
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Gift size={20} className="text-pink-500" />
          <h4 className="font-bold text-gray-900">Invite & Earn</h4>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-2 pl-4">
          <span className="font-mono font-bold text-gray-700 flex-1">{referralCode}</span>
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-bold text-sm ${
              copied ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">Refer a friend and get 2500 points when they file their first return!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">4</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Total Referrals</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">2000</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Points Redeemed</p>
        </div>
      </div>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="font-bold text-gray-900 text-sm">Recent Activity</h4>
          <button className="text-xs text-blue-600 font-bold hover:underline">View All</button>
        </div>
        <div className="space-y-2">
          {history.map((item) => (
            <div key={item.id} className="bg-white border border-gray-50 rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  <ArrowUpRight size={16} className={item.type === 'debit' ? 'rotate-180' : ''} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.reason}</p>
                  <p className="text-[10px] text-gray-500">{item.desc} • {item.date}</p>
                </div>
              </div>
              <p className={`font-bold text-sm ${item.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {item.type === 'credit' ? '+' : '-'}{item.points}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-800 text-center">
        Points can be used for service discounts. For cash redemption, please contact admin with your referral details.
      </div>
    </div>
  );
}
