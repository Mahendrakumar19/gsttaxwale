'use client';

import { useEffect, useState } from 'react';
import { Share2, Copy, MessageCircle, Gift } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ReferralDashboard() {
  const [referralInfo, setReferralInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralInfo();
  }, []);

  const fetchReferralInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/user/referral-info');
      setReferralInfo(response.data.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load referral info');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/ref/${referralInfo?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const link = `${window.location.origin}/ref/${referralInfo?.referralCode}`;
    const text = `Join GST Tax Wale and get expert tax filing support! Use my referral link: ${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Gift className="w-5 h-5 text-blue-600" />
        Referral & Rewards
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <p className="text-xs uppercase text-gray-600 font-bold mb-1">Total Referrals</p>
          <p className="text-2xl font-bold text-blue-900">{referralInfo?.totalReferrals || 0}</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <p className="text-xs uppercase text-gray-600 font-bold mb-1">Successful</p>
          <p className="text-2xl font-bold text-green-900">{referralInfo?.successfulReferrals || 0}</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <p className="text-xs uppercase text-gray-600 font-bold mb-1">Points Earned</p>
          <p className="text-2xl font-bold text-purple-900">{referralInfo?.totalPointsEarned || 0}</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
          <p className="text-xs uppercase text-gray-600 font-bold mb-1">Points Redeemed</p>
          <p className="text-2xl font-bold text-red-900">{referralInfo?.pointsRedeemed || 0}</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <p className="text-xs uppercase text-gray-600 font-bold mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-orange-900">{referralInfo?.walletPoints || 0}</p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Your Referral Code</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralInfo?.referralCode || ''}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm"
          />
          <button
            onClick={copyReferralLink}
            className={`px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 ${
              copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Copy size={18} />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Share Options */}
      <div className="flex gap-2">
        <button
          onClick={shareViaWhatsApp}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
        >
          <MessageCircle size={18} />
          Share on WhatsApp
        </button>
        <button
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium flex items-center justify-center gap-2"
        >
          <Share2 size={18} />
          Share More
        </button>
      </div>
    </div>
  );
}
