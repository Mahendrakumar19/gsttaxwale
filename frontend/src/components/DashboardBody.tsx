'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import api from '@/lib/api';

interface Filing {
  id: string;
  financialYear: string;
  status: 'draft' | 'submitted' | 'approved';
  createdAt: string;
}

export default function DashboardBody() {
  const [filings, setFilings] = useState<Filing[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalDeductions: 0,
    taxAmount: 0,
    refund: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/dashboard/overview');
      setStats(response.data.stats || stats);
      setFilings(response.data.recentFilings || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Use default values if API call fails
      setStats({
        totalIncome: 500000,
        totalDeductions: 150000,
        taxAmount: 45000,
        refund: 5000,
      });
      setFilings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mx-auto max-w-7xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 min-h-screen">
      <div className="mb-8">
        <h2 className="mb-2 text-4xl font-bold text-white">Dashboard</h2>
        <p className="text-amber-300/80">Manage your income tax filings & earn referral bonuses</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
        <StatCard
          label="Total Income"
          value={`₹${stats.totalIncome.toLocaleString()}`}
          color="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-500/30"
          textColor="text-amber-400"
          icon="💰"
        />
        <StatCard
          label="Deductions"
          value={`₹${stats.totalDeductions.toLocaleString()}`}
          color="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/30"
          textColor="text-green-400"
          icon="✂️"
        />
        <StatCard
          label="Tax Amount"
          value={`₹${stats.taxAmount.toLocaleString()}`}
          color="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/30"
          textColor="text-blue-400"
          icon="📋"
        />
        <StatCard
          label="Expected Refund"
          value={`₹${stats.refund.toLocaleString()}`}
          color="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-yellow-500/30"
          textColor="text-yellow-400"
          icon="💸"
        />
      </div>

      {/* Tax Calculator & Upcoming Due Dates */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
        {/* Tax Calculator Widget */}
        <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-500/30 rounded-lg shadow-lg backdrop-blur">
          <div className="p-6 border-b border-amber-500/20">
            <h3 className="text-2xl font-bold text-amber-300">📊 Tax Calculator</h3>
            <p className="text-sm text-amber-200/70 mt-1">Estimate your tax liability</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-300 mb-1">
                  Total Income (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter your income"
                  className="w-full px-4 py-2 bg-slate-800/50 border border-amber-500/30 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300 mb-1">
                  Deductions (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter total deductions"
                  className="w-full px-4 py-2 bg-slate-800/50 border border-amber-500/30 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-lg hover:from-amber-700 hover:to-yellow-600 hover:shadow-lg hover:shadow-amber-600/40 transition font-semibold">
                Calculate Tax
              </button>
              <div className="pt-4 border-t border-amber-500/20">
                <p className="text-sm text-amber-200/70">Estimated Tax: <span className="text-lg font-bold text-amber-400">₹0</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Due Dates Widget */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-500/30 rounded-lg shadow-lg backdrop-blur">
          <div className="p-6 border-b border-green-500/20">
            <h3 className="text-2xl font-bold text-green-300">📅 Upcoming Deadlines</h3>
            <p className="text-sm text-green-200/70 mt-1">Important dates you need to track</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between p-3 bg-amber-900/40 border border-amber-500/30 rounded-lg">
                <div>
                  <p className="font-semibold text-amber-300">Income Tax Filing</p>
                  <p className="text-sm text-amber-200/70">FY 2024-25</p>
                </div>
                <span className="text-sm font-bold text-amber-400">31 July 2025</span>
              </div>
              <div className="flex items-start justify-between p-3 bg-blue-900/40 border border-blue-500/30 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-300">GSTR-1 Filing</p>
                  <p className="text-sm text-blue-200/70">Monthly/Quarterly</p>
                </div>
                <span className="text-sm font-bold text-blue-400">15th Monthly</span>
              </div>
              <div className="flex items-start justify-between p-3 bg-green-900/40 border border-green-500/30 rounded-lg">
                <div>
                  <p className="font-semibold text-green-300">GSTR-3B Filing</p>
                  <p className="text-sm text-green-200/70">Monthly/Quarterly</p>
                </div>
                <span className="text-sm font-bold text-green-400">20th Monthly</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex items-center justify-between p-6 mb-8 bg-gradient-to-r from-amber-600 to-yellow-500 rounded-lg shadow-lg">
        <div>
          <h3 className="mb-2 text-2xl font-bold text-white">Ready to file your ITR?</h3>
          <p className="text-amber-50">Start a new income tax return filing for the financial year</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 font-semibold text-amber-600 bg-white rounded-lg hover:bg-amber-50 hover:shadow-lg transition">
          <span>+</span>
          Create New Filing
        </button>
      </div>

      {/* Recent Filings */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/30 rounded-lg shadow-lg backdrop-blur">
        <div className="p-6 border-b border-slate-600/30">
          <h3 className="text-2xl font-bold text-white">Recent Filings</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center text-slate-400">Loading...</div>
        ) : filings.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            No filings yet. Create your first one to get started!
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-slate-600/30 bg-slate-900/30">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-left text-amber-400">
                  Financial Year
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-amber-400">
                  Status
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-amber-400">
                  Created
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-amber-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filings.map((filing) => (
                <tr key={filing.id} className="border-b border-slate-600/20 hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4 text-sm text-white">
                    {filing.financialYear}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        filing.status === 'submitted'
                          ? 'bg-green-900/50 text-green-400 border border-green-500/30'
                          : filing.status === 'approved'
                          ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-900/50 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {filing.status.charAt(0).toUpperCase() +
                        filing.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {new Date(filing.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-amber-400 hover:text-amber-300 transition font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  color: string;
  textColor: string;
  icon: string;
}

function StatCard({ label, value, color, textColor, icon }: StatCardProps) {
  return (
    <div className={`${color} border rounded-lg p-6 backdrop-blur`}>
      <div className="flex items-start justify-between mb-2">
        <p className={`${textColor} text-sm font-semibold`}>{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`${textColor} text-3xl font-bold`}>{value}</p>
    </div>
  );
}
