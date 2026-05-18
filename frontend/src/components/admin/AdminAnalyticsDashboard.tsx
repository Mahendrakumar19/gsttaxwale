'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Package, DollarSign, FileCheck, Clock } from 'lucide-react';
import api from '@/lib/api';

export default function AdminAnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeServices: 0,
    totalRevenue: 0,
    pendingDocuments: 0,
    completedCases: 0,
    avgFilingTime: '5 days',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder stats - connect to real API
    setStats({
      totalUsers: 1245,
      activeServices: 234,
      totalRevenue: 589450,
      pendingDocuments: 42,
      completedCases: 1089,
      avgFilingTime: '5 days',
    });
    setLoading(false);
  }, []);

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      trend: '+12% from last month',
    },
    {
      label: 'Active Services',
      value: stats.activeServices,
      icon: Package,
      color: 'bg-green-50 text-green-600',
      trend: '+5% this month',
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-50 text-purple-600',
      trend: '+23% YoY',
    },
    {
      label: 'Pending Documents',
      value: stats.pendingDocuments,
      icon: FileCheck,
      color: 'bg-orange-50 text-orange-600',
      trend: '-3% this week',
    },
    {
      label: 'Completed Cases',
      value: stats.completedCases,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
      trend: '+8% this month',
    },
    {
      label: 'Avg Filing Time',
      value: stats.avgFilingTime,
      icon: Clock,
      color: 'bg-indigo-50 text-indigo-600',
      trend: '↓ improved',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="p-6 bg-white rounded-lg shadow">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${card.color}`}>
                <Icon size={24} />
              </div>
              <p className="text-sm text-gray-600 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-2">{card.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Chart placeholder - Connect chart library</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Distribution</h3>
          <div className="h-64 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Chart placeholder - Connect chart library</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <p className="text-sm text-gray-700">User activity placeholder {item}</p>
              <p className="text-xs text-gray-500 ml-auto">2 hours ago</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
