'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';
import { Users, FileText, ShoppingCart, Ticket, Gift, BarChart3, TrendingUp, Activity, Layout, MapPin, Eye } from 'lucide-react';

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
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-gray-900 text-lg">Loading dashboard…</div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: ShoppingCart,
      label: 'Orders',
      desc: 'View and manage orders',
      href: '/admin/orders',
      color: 'green',
      count: stats.orders,
    },
    {
      icon: Activity,
      label: 'Services',
      desc: 'Manage tax services',
      href: '/admin/services',
      color: 'indigo',
      count: stats.services,
    },
    {
      icon: Gift,
      label: 'Referrals',
      desc: 'Track user rewards',
      href: '/admin/referrals',
      color: 'pink',
      count: stats.totalUsers,
    },
    {
      icon: Users,
      label: 'Users',
      desc: 'Manage customer accounts',
      href: '/admin/customers',
      color: 'blue',
      count: stats.totalUsers,
    },
  ];

  return (
    <div className="px-6 py-10 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-widest">Real-time Analytics</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Welcome back, <span className="text-blue-600 font-bold">{adminUser?.name || 'Administrator'}</span></p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Services</p>
          <p className="text-4xl font-black text-slate-900">{stats.services}</p>
          <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-xs uppercase">
            <BarChart3 size={14} />
            <span>Active Portfolio</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
          <p className="text-4xl font-black text-slate-900">{stats.orders}</p>
          <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-xs uppercase">
            <ShoppingCart size={14} />
            <span>Processed</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <BarChart3 size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="text-4xl font-black text-slate-900">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
          <div className="mt-4 flex items-center gap-2 text-purple-600 font-bold text-xs uppercase">
            <Activity size={14} />
            <span>Growth Curve</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Users</p>
          <p className="text-4xl font-black text-slate-900">{stats.totalUsers}</p>
          <div className="mt-4 flex items-center gap-2 text-orange-600 font-bold text-xs uppercase">
            <Users size={14} />
            <span>Engagement</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Zap size={20} /></div>
          Operational Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 hover:bg-white hover:border-blue-400 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <action.icon size={24} />
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors">
                   <span className="text-[10px] font-black text-blue-600">{action.count}</span>
                </div>
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{action.label}</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10">
          <h2 className="text-xl font-black mb-8 uppercase tracking-tight flex items-center gap-3">
            <div className="p-2 bg-white/10 text-white rounded-xl"><Shield size={20} /></div>
            Core Authentication
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Admin Name</p>
              <p className="text-lg font-bold">{adminUser?.name || 'Administrator'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Master Identity</p>
              <p className="text-lg font-bold">{adminUser?.email || 'admin@gsttaxwale.com'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Authorization Level</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-lg font-bold uppercase tracking-widest text-xs">Full System Access</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Platform Engine v2.0 • Build ID: GST-ADMIN-PRO</p>
      </div>
    </div>
  );
}
  );
}
