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
      label: 'Network Users',
      value: stats.totalUsers,
      icon: Users,
      trend: '+12% Variance',
    },
    {
      label: 'Operational Services',
      value: stats.activeServices,
      icon: Package,
      trend: '+5% Performance',
    },
    {
      label: 'Gross Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: '+23% Growth Index',
    },
    {
      label: 'Compliance Queue',
      value: stats.pendingDocuments,
      icon: FileCheck,
      trend: '-3% Latency',
    },
    {
      label: 'Resolved Units',
      value: stats.completedCases,
      icon: TrendingUp,
      trend: '+8% Efficiency',
    },
    {
      label: 'Transaction Speed',
      value: stats.avgFilingTime,
      icon: Clock,
      trend: 'Optimized',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm group hover:border-slate-900 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.trend}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Revenue Trajectory</h3>
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fiscal FY25</span>
             </div>
          </div>
          <div className="h-72 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
               <TrendingUp size={20} className="text-slate-300" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data Visualization Offline</p>
          </div>
        </div>

        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Service Allocation</h3>
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Distribution Index</span>
             </div>
          </div>
          <div className="h-72 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
               <Package size={20} className="text-slate-300" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analytic Stream Pending</p>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">System Audit Log</h3>
           <button className="text-[9px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-all">Export Report</button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-200 transition-all group">
              <div className="w-1 h-1 bg-slate-300 rounded-full group-hover:bg-slate-900 transition-all"></div>
              <p className="text-xs font-bold text-slate-700 tracking-tight">Security log entry sequence ID-X9002{item} — Process initialized</p>
              <div className="flex items-center gap-1.5 ml-auto text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                 <Clock size={10} />
                 <span>2h ago</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
