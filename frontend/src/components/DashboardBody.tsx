'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Briefcase, PieChart, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

interface Filing {
  id: string;
  financialYear: string;
  status: 'draft' | 'submitted' | 'approved';
  createdAt: string;
}

interface DashboardStats {
  totalIncome: number;
  totalDeductions: number;
  taxAmount: number;
  refund: number;
}

export default function DashboardBody() {
  const [filings, setFilings] = useState<Filing[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalDeductions: 0,
    taxAmount: 0,
    refund: 0,
  });
  const [loading, setLoading] = useState(true);
  const [calculatedTax, setCalculatedTax] = useState(0);
  const [incomeInput, setIncomeInput] = useState('');
  const [deductionsInput, setDeductionsInput] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/dashboard/overview');
      if (response.data?.stats) {
        setStats(response.data.stats);
      }
      if (response.data?.recentFilings) {
        setFilings(response.data.recentFilings);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateTax = () => {
    const income = parseFloat(incomeInput) || 0;
    const deductions = parseFloat(deductionsInput) || 0;
    const taxableIncome = income - deductions;
    
    // Simple tax calculation (can be improved with actual slab logic)
    let tax = 0;
    if (taxableIncome > 1000000) {
      tax = (taxableIncome - 1000000) * 0.30 + 112500;
    } else if (taxableIncome > 500000) {
      tax = (taxableIncome - 500000) * 0.20 + 12500;
    } else if (taxableIncome > 250000) {
      tax = (taxableIncome - 250000) * 0.05;
    }
    
    setCalculatedTax(tax);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="mb-2 text-4xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mb-8">Manage your income tax filings & earn referral bonuses</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
        <StatCard
          label="Total Income"
          value={`₹${stats.totalIncome.toLocaleString()}`}
          color="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-500/30"
          textColor="text-blue-600"
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
            <h3 className="text-2xl font-bold text-gray-900">📊 Tax Calculator</h3>
            <p className="text-sm text-gray-600 mt-1">Estimate your tax liability</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-300 mb-1">
                  Total Income (₹)
                </label>
                <input
                  type="number"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
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
                  value={deductionsInput}
                  onChange={(e) => setDeductionsInput(e.target.value)}
                  placeholder="Enter total deductions"
                  className="w-full px-4 py-2 bg-slate-800/50 border border-amber-500/30 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>
              <button onClick={handleCalculateTax} className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-600/40 transition font-semibold">
                Calculate Tax
              </button>
              <div className="pt-4 border-t border-amber-500/20">
                <p className="text-sm text-gray-600">Estimated Tax: <span className="text-lg font-bold text-blue-600">₹{calculatedTax.toLocaleString()}</span></p>
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
                  <p className="font-semibold text-gray-900">Income Tax Filing</p>
                  <p className="text-sm text-gray-600">FY 2024-25</p>
                </div>
                <span className="text-sm font-bold text-blue-600">31 July 2025</span>
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
          <h3 className="mb-2 text-2xl font-bold text-gray-900">Ready to file your ITR?</h3>
          <p className="text-gray-700">Start a new income tax return filing for the financial year</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:shadow-lg transition">
          <span>+</span>
          Create New Filing
        </button>
      </div>

      {/* Recent Filings */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/30 rounded-lg shadow-lg backdrop-blur">
        <div className="p-6 border-b border-slate-600/30">
          <h3 className="text-2xl font-bold text-gray-900">Recent Filings</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : filings.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
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
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {filing.financialYear}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        filing.status === 'submitted'
                          ? 'bg-green-900/50 text-green-400 border border-green-500/30'
                          : filing.status === 'approved'
                          ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30'
                          : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}
                    >
                      {filing.status.charAt(0).toUpperCase() +
                        filing.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(filing.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-700 transition font-medium">
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
