"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();
    if (!token || user?.role !== 'admin') {
      router.push('/admin');
      return;
    }
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, [router]);

  async function loadOrders() {
    setRefreshing(true);
    try {
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders`,
        config
      );
      setOrders(res.data.data?.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  async function handleUpdateOrderStatus(orderId: string, newStatus: string) {
    try {
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/orders/${orderId}`,
        { status: newStatus },
        config
      );
      loadOrders();
    } catch (err) {
      alert('Failed to update order status');
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/30 text-green-200">✓ Paid</span>;
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/30 text-yellow-200">⏳ Pending</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status?.toUpperCase()}</span>;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top Navigation */}
      <nav className="glassmorphic sticky top-0 z-50 border-b border-slate-600/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-gradient-text hover:opacity-80 transition">
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Customer Orders</h1>
            <div className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-2 ${refreshing ? 'bg-blue-500/30 text-blue-200 animate-pulse' : 'bg-green-500/30 text-green-200'}`}>
              <span className={`w-2 h-2 rounded-full ${refreshing ? 'bg-blue-400' : 'bg-green-400'}`}></span>
              {refreshing ? 'Syncing…' : 'Live'}
            </div>
          </div>
          <button
            onClick={() => {
              adminAuth.clearAdmin();
              router.push('/admin');
            }}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg hover:shadow-red-600/50"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Order ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Service</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Date</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{o.id.substring(0, 8)}…</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{o.serviceId || '—'}</td>
                    <td className="px-6 py-4 font-semibold text-green-600">₹{o.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(o.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{o.customer?.name || o.customer?.email || 'Guest'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {o.status !== 'paid' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'paid')}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition"
                        >
                          Mark Paid
                        </button>
                      )}
                      {o.status !== 'pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'pending')}
                          className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition"
                        >
                          Mark Pending
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-900">📊 No orders yet. Orders will appear here once customers make purchases.</div>
          )}
        </div>
      </div>
    </div>
  );
}
