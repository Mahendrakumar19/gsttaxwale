'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';
import { Users, FileText, ShoppingCart, Ticket, Gift, BarChart3, TrendingUp, Activity, Layout, MapPin, Eye, Zap, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [stats, setStats] = useState({
    services: 0,
    orders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalUsers: 0,
    clients: 0,
    documents: 0,
    tickets: 0,
    visitors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const adminToken = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();
    
    if (!adminToken || !user || user.role !== 'admin') {
      router.push('/auth/admin-login');
      return;
    }
    
    setAdminUser(user);
    setIsAuthenticated(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadStats() {
      try {
        const response = await api.get('/api/admin/analytics');
        const data = response.data.data || response.data;
        
        setStats({
          services: data.totalServices || 0,
          orders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          pendingOrders: data.pendingOrders || 0,
          totalUsers: data.totalUsers || 0,
          clients: data.totalUsers || 0,
          documents: data.totalDocuments || 0,
          tickets: data.totalTickets || 0,
          visitors: data.totalVisitors || 0,
        });
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Dashboard Intelligence...</p>
      </div>
    );
  }

  const quickActions = [
    {
      icon: ShoppingCart,
      label: 'Order Management',
      desc: 'Verify and process transactions',
      href: '/admin/orders',
      count: stats.orders,
    },
    {
      icon: Activity,
      label: 'Service Inventory',
      desc: 'Configure tax and legal offerings',
      href: '/admin/services',
      count: stats.services,
    },
    {
      icon: Gift,
      label: 'Affiliate Streams',
      desc: 'Audit referral network rewards',
      href: '/admin/referrals',
      count: stats.totalUsers,
    },
    {
      icon: Users,
      label: 'Identity Registry',
      desc: 'Manage customer account security',
      href: '/admin/users',
      count: stats.totalUsers,
    },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Control</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Platform state as of {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="uppercase tracking-widest">Network Secure & Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm group hover:border-slate-900 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
              <TrendingUp size={18} />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Service Units</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.services}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Active Inventory</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm group hover:border-slate-900 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
              <ShoppingCart size={18} />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Transaction Flow</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.orders}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Confirmed Ledger</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm group hover:border-slate-900 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
              <BarChart3 size={18} />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Capital Inflow</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Revenue Velocity</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm group hover:border-slate-900 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
              <Users size={18} />
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Client Base</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.totalUsers}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Verified Identity</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Operational Modules</h2>
          <div className="h-px flex-1 bg-slate-100 ml-8" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-900 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                  <action.icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest">{action.count} units</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{action.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* System Footer */}
      <div className="mt-16 p-8 bg-slate-900 rounded-2xl text-white shadow-2xl overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 -translate-y-1/4 translate-x-1/4">
           <Shield size={240} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
              <Shield size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight">Infrastructure Encryption Level 4 Active</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Logged in as {adminUser?.email || 'System Administrator'}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
               <span>Build 4.2.0-STABLE</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
               <span>Audit Protocol 100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
