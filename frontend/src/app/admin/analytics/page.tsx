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
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/orders`, config).catch(() => ({ data: { data: { orders: [] } } })),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/admin/users`, config).catch(() => ({ data: { data: { users: [] } } })),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/services`, config).catch(() => ({ data: { data: { services: [] } } })),
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
    return <div className="flex items-center justify-center h-96 text-gray-600">Loading analytics…</div>;
  }

  return (
    <div className="px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Users</p>
          <div className="text-4xl font-bold text-blue-600 mb-1">{stats.totalUsers}</div>
          <p className="text-xs text-gray-500">+{stats.newUsersThisMonth} this month</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Orders</p>
          <div className="text-4xl font-bold text-purple-600 mb-1">{stats.totalOrders}</div>
          <p className="text-xs text-gray-500">{stats.completedOrders} completed</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Revenue</p>
          <div className="text-4xl font-bold text-green-600 mb-1">₹{stats.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-gray-500">Avg: ₹{stats.avgOrderValue.toFixed(0)} per order</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Services</p>
          <div className="text-4xl font-bold text-indigo-600 mb-1">{stats.totalServices}</div>
          <p className="text-xs text-gray-500">Available services</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium mb-2">Conversion Rate</p>
          <div className="text-4xl font-bold text-cyan-600 mb-1">
            {stats.totalUsers > 0 ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-xs text-gray-500">Orders / Users</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium mb-2">Completion Rate</p>
          <div className="text-4xl font-bold text-orange-600 mb-1">
            {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-xs text-gray-500">Paid / Total</p>
        </div>
      </div>
    </div>
  );
}
