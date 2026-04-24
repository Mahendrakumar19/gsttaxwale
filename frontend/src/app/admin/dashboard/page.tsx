'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { Users, FileText, ShoppingCart, Ticket, Gift, BarChart3, TrendingUp, Activity } from 'lucide-react';

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
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const adminToken = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();
    
    if (!adminToken || !user || user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    
    setAdminUser(user);
    setIsAuthenticated(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadStats() {
      try {
        const token = adminAuth.getAdminToken();
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [servRes, ordRes, usersRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/services`, config).catch(() => ({ data: { data: { services: [] } } })),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/orders`, config).catch(() => ({ data: { data: { orders: [] } } })),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/admin/users`, config).catch(() => ({ data: { data: { users: [] } } })),
        ]);

        const services = servRes.data.data?.services || [];
        const orders = ordRes.data.data?.orders || [];
        const users = usersRes.data.data?.users || [];
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
        const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;

        setStats({
          services: services.length,
          orders: orders.length,
          totalRevenue,
          pendingOrders,
          totalUsers: users.length,
          clients: 15,
          documents: 128,
          tickets: 23,
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
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
      icon: FileText,
      label: 'Documents',
      desc: 'Manage uploaded documents',
      href: '/admin/documents',
      color: 'purple',
      count: stats.documents,
    },
    {
      icon: Ticket,
      label: 'Support Tickets',
      desc: 'Handle customer support',
      href: '/admin/tickets',
      color: 'orange',
      count: stats.tickets,
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-700 mt-1">Welcome back, {adminUser?.name || 'Administrator'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Services</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{stats.services}</p>
              </div>
              <TrendingUp className="text-blue-400" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{stats.orders}</p>
              </div>
              <Activity className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
              </div>
              <BarChart3 className="text-purple-400" size={24} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">{stats.totalUsers}</p>
              </div>
              <Users className="text-orange-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${action.color}-100`}>
                  <action.icon className={`text-${action.color}-600`} size={24} />
                </div>
                <span className={`text-2xl font-bold text-${action.color}-600`}>{action.count}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{action.label}</h3>
              <p className="text-sm text-gray-700">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-gray-900 text-sm">Admin Name</p>
              <p className="text-lg font-semibold text-gray-900">{adminUser?.name || 'Administrator'}</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-gray-900 text-sm">Admin Email</p>
              <p className="text-lg font-semibold text-gray-900">{adminUser?.email || 'admin@example.com'}</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-gray-900 text-sm">Role</p>
              <p className="text-lg font-semibold text-gray-900">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
