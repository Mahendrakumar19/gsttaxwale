'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [ordersRes, usersRes, servicesRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/orders`, config).catch(() => ({ data: { data: { orders: [] } } })),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/users`, config).catch(() => ({ data: { data: { users: [] } } })),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/services`, config).catch(() => ({ data: { data: { services: [] } } })),
      ]);

      const orders = ordersRes.data.data?.orders || [];
      const users = usersRes.data.data?.users || [];
      const services = servicesRes.data.data?.services || [];

      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
      const completedOrders = orders.filter((o: any) => o.status === 'paid').length;
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      setStats({
        totalUsers: users.length,
        totalOrders: orders.length,
        completedOrders,
        totalRevenue,
        avgOrderValue,
        totalServices: services.length,
        newUsersThisMonth: users.filter((u: any) => {
          const date = new Date(u.createdAt);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length,
      });
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aggregating Global Metrics...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Holistic overview of platform engagement and financial throughput</p>
        </div>
        <div className="hidden md:block px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Real-time Feed Active
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Acquisition */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Base</p>
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">👥</div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalUsers.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-wider">
            <span>+{stats.newUsersThisMonth}</span>
            <span className="text-slate-400 font-medium lowercase">growth this month</span>
          </div>
        </div>

        {/* Order Volume */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Orders</p>
            <div className="w-8 h-8 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center">📦</div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalOrders.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <span>{stats.completedOrders}</span>
            <span className="text-slate-400 font-medium lowercase">fully processed</span>
          </div>
        </div>

        {/* Revenue Throughput */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Revenue</p>
            <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">₹</div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">₹{stats.totalRevenue.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="font-medium lowercase tracking-normal">Average ARPU:</span>
            <span className="text-slate-900">₹{stats.avgOrderValue.toFixed(0)}</span>
          </div>
        </div>

        {/* Services Index */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Catalog</p>
            <div className="w-8 h-8 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center">🛠️</div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalServices}</div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live and manageable assets</p>
        </div>

        {/* Conversion Index */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversion Index</p>
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">📈</div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {stats.totalUsers > 0 ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Orders per acquired user</p>
        </div>

        {/* Fulfillment Ratio */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fulfillment Ratio</p>
            <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">✅</div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid versus pending orders</p>
        </div>
      </div>
    </div>
  );
}
