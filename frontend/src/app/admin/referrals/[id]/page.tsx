"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { ArrowLeft, Share2, Mail, TrendingUp, Save } from 'lucide-react';

export default function AdminReferralDetails() {
  const router = useRouter();
  const params = useParams();
  const referralId = params.id;
  
  const [referral, setReferral] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    referralStatus: '',
    commissionAmount: 0,
    notes: ''
  });

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();

    if (!token || user?.role !== 'admin') {
      router.push('/admin');
      return;
    }

    loadReferral();
  }, [referralId, router]);

  async function loadReferral() {
    try {
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/referrals/${referralId}`,
        config
      );
      const data = res.data.data?.referral;
      setReferral(data);
      setFormData({
        referralStatus: data.referralStatus,
        commissionAmount: data.commissionAmount || 0,
        notes: data.notes || ''
      });
    } catch (err) {
      console.error('Failed to load referral', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateReferral(e: React.FormEvent) {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/referrals/${referralId}`,
        formData,
        config
      );
      setReferral(res.data.data?.referral);
      alert('Referral updated successfully');
    } catch (err) {
      console.error('Failed to update referral', err);
      alert('Failed to update referral');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading referral...</div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-red-400 text-xl">Referral not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/referrals" className="text-slate-400 hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-white">Referral Management</h1>
        </div>

        {/* Referral Info */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 rounded-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Referral Details</h2>
              <div className="space-y-3 text-slate-300">
                <div>
                  <span className="text-slate-400 font-semibold">Referrer:</span> {referral.referrer?.name}
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-amber-400" />
                  {referral.referrer?.email}
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Referred Email:</span> {referral.refereeEmail}
                </div>
                {referral.referee && (
                  <div className="bg-slate-900/50 p-3 rounded mt-3">
                    <span className="text-green-400 font-semibold">✓ Referee Signed Up:</span> {referral.referee?.name}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase">Commission Percentage</span>
                <div className="text-3xl font-bold text-amber-400">{referral.commissionPercent}%</div>
              </div>
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase">Commission Paid</span>
                <div className="text-2xl font-bold text-green-400">₹{referral.commissionAmount.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase">Status</span>
                <div className={`text-lg font-bold capitalize ${
                  referral.referralStatus === 'completed' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {referral.referralStatus}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleUpdateReferral} className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={24} className="text-amber-400" />
            Update Commission & Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Commission Amount (₹)</label>
              <input
                type="number"
                value={formData.commissionAmount}
                onChange={(e) => setFormData({ ...formData, commissionAmount: parseFloat(e.target.value) })}
                step="0.01"
                className="w-full bg-slate-900/50 border border-slate-600/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-slate-500 text-xs mt-1">Based on {referral.commissionPercent}% commission</p>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Referral Status</label>
              <select
                value={formData.referralStatus}
                onChange={(e) => setFormData({ ...formData, referralStatus: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-600/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-semibold mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this referral..."
              rows={4}
              className="w-full bg-slate-900/50 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold py-3 rounded-lg hover:from-amber-500 hover:to-amber-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {updating ? 'Updating...' : 'Save Changes'}
          </button>
        </form>

        {referral.notes && (
          <div className="mt-8 bg-slate-800/30 border border-slate-700/30 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm font-semibold mb-2 uppercase">Previous Notes</h3>
            <p className="text-slate-300">{referral.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
