"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';
import { RefreshCw, ShoppingCart } from 'lucide-react';

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
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [router]);

  async function loadOrders() {
    setRefreshing(true);
    try {
      const res = await api.get('/api/orders');
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
      await api.put(`/api/admin/orders/${orderId}`, { status: newStatus });
      loadOrders();
    } catch (err) {
      alert('Failed to update order status');
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">✓ Paid</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">⏳ Pending</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status?.toUpperCase()}</span>;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={20} className="text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Orders</h1>
          </div>
          <p className="text-gray-500 text-sm">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-2 ${refreshing ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
            <span className={`w-2 h-2 rounded-full ${refreshing ? 'bg-blue-400' : 'bg-green-400'}`}></span>
            {refreshing ? 'Syncing…' : 'Live'}
          </div>
          <button
            onClick={loadOrders}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-4 sm:px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-4 sm:px-6 py-3 text-sm font-mono text-gray-900">{o.id.substring(0, 8)}…</td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-900 max-w-[150px] truncate">{o.service?.title || o.serviceId || '—'}</td>
                  <td className="px-4 sm:px-6 py-3 font-semibold text-green-600 text-sm">₹{o.amount?.toLocaleString()}</td>
                  <td className="px-4 sm:px-6 py-3">{getStatusBadge(o.status)}</td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-900">
                    <div className="font-medium">{o.customer?.name || o.guestName || 'Guest'}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[120px]">{o.customer?.email || o.guestEmail}</div>
                    {o.guestPan && <div className="text-[10px] text-blue-600 font-mono uppercase">PAN: {o.guestPan}</div>}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {o.status !== 'paid' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'paid')}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition"
                        >
                          Mark Paid
                        </button>
                      )}
                      {o.status !== 'pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'pending')}
                          className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition"
                        >
                          Pending
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">📊 No orders yet. Orders will appear here once customers make purchases.</div>
        )}
      </div>
    </div>
  );
}
