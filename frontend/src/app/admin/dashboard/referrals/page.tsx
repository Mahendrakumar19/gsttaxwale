"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { Share2, ArrowLeft } from 'lucide-react';

export default function ReferralsPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalReferrals: 0, activeReferrals: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    if (!token) {
      router.push('/admin');
      return;
    }

    loadReferrals(token);
  }, [router]);

  async function loadReferrals(token: string) {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [refRes, statsRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/referrals`,
          config
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/referrals-stats`,
          config
        ),
      ]);

      setReferrals(refRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="hover:text-purple-400 transition">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-3">
          <Share2 size={32} className="text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold">Referrals</h1>
            <p className="text-slate-400">Manage referral program</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Total Referrals</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">{stats.totalReferrals || 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Active Referrals</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{stats.activeReferrals || 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Total Earnings</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            ₹{(stats.totalEarnings || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Referrer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Referred</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Commission</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No referrals found
                  </td>
                </tr>
              ) : (
                referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-700/20 transition">
                    <td className="px-6 py-4">{ref.referrerName}</td>
                    <td className="px-6 py-4">{ref.referredName}</td>
                    <td className="px-6 py-4 text-green-400">
                      ₹{ref.commission?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ref.status === 'active'
                          ? 'bg-green-900/30 text-green-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
