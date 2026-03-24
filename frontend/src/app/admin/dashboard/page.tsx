"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { adminAuth } from '../../../lib/adminAuth';

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [stats, setStats] = useState({ services: 0, orders: 0, totalRevenue: 0, paidRevenue: 0, pendingOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();

    // Redirect if not admin
    if (!token || user?.role !== 'admin') {
      router.push('/admin');
      return;
    }

    setAdminUser(user);

    async function loadStats() {
      setRefreshing(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [servRes, ordRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/services`, config),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders`, config),
        ]);

        const services = servRes.data.data?.services || [];
        const orders = ordRes.data.data?.orders || [];
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
        const paidRevenue = orders.filter((o: any) => o.status === 'paid').reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
        const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;

        setStats({
          services: services.length,
          orders: orders.length,
          totalRevenue,
          paidRevenue,
          pendingOrders,
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    }

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [router]);

  function handleLogout() {
    adminAuth.clearAdmin();
    router.push('/admin');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-slate-300 text-lg">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation */}
      <nav className="glassmorphic sticky top-0 z-50 border-b border-slate-600/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center font-bold text-white">₹</div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">GST Tax Wale Admin</h1>
              <p className="text-xs text-slate-400">Control Panel</p>
            </div>
            <div className={`ml-4 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-2 ${refreshing ? 'bg-blue-500/30 text-blue-200 animate-pulse' : 'bg-green-500/30 text-green-200'}`}>
              <span className={`w-2 h-2 rounded-full ${refreshing ? 'bg-blue-400' : 'bg-green-400'}`}></span>
              {refreshing ? 'Syncing…' : 'Live'}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-100">{adminUser?.name || 'Administrator'}</p>
              <p className="text-xs text-slate-400">{adminUser?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg hover:shadow-red-600/50"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glassmorphic-dark p-6 rounded-xl border border-slate-500/20 group hover:border-orange-500/50 transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Total Services</p>
                <div className="text-4xl font-bold gradient-text">{stats.services}</div>
              </div>
              <div className="text-3xl">📦</div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Services available for purchase</p>
          </div>

          <div className="glassmorphic-dark p-6 rounded-xl border border-slate-500/20 group hover:border-blue-500/50 transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Total Orders</p>
                <div className="text-4xl font-bold text-blue-400">{stats.orders}</div>
              </div>
              <div className="text-3xl">📋</div>
            </div>
            <p className="text-xs text-slate-500 mt-2">All customer orders</p>
          </div>

          <div className="glassmorphic-dark p-6 rounded-xl border border-slate-500/20 group hover:border-green-500/50 transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Total Revenue</p>
                <div className="text-4xl font-bold text-green-400">₹{stats.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
            <p className="text-xs text-slate-500 mt-2">All-time revenue</p>
          </div>

          <div className="glassmorphic-dark p-6 rounded-xl border border-slate-500/20 group hover:border-yellow-500/50 transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Pending Orders</p>
                <div className="text-4xl font-bold text-yellow-400">{stats.pendingOrders}</div>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Awaiting processing</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/services" className="glassmorphic-dark p-8 rounded-xl border border-slate-500/20 hover:border-orange-500/50 transition group cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="text-5xl">⚙️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-orange-400 transition">Manage Services</h3>
                <p className="text-slate-400 text-sm mb-4">Add, edit, or remove tax services from your catalog</p>
                <span className="inline-block text-sm font-medium text-orange-400 group-hover:translate-x-1 transition">View Services →</span>
              </div>
            </div>
          </Link>

          <Link href="/admin/orders" className="glassmorphic-dark p-8 rounded-xl border border-slate-500/20 hover:border-blue-500/50 transition group cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="text-5xl">📊</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition">View Orders</h3>
                <p className="text-slate-400 text-sm mb-4">Track and manage all customer orders and payments</p>
                <span className="text-sm font-medium text-blue-400 group-hover:translate-x-1 transition inline-block">View Orders →</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
