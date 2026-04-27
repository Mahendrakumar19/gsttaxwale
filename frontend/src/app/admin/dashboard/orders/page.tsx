"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    if (!token) {
      router.push('/admin');
      return;
    }

    loadOrders(token);
  }, [router]);

  async function loadOrders(token: string) {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/orders`,
        config
      );
      setOrders(res.data.data?.orders || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="hover:text-purple-400 transition">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <ShoppingCart size={32} className="text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold">Orders</h1>
              <p className="text-slate-400">Manage customer orders</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-700/20 transition">
                    <td className="px-6 py-4 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4">{order.customerName}</td>
                    <td className="px-6 py-4">₹{order.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'completed' ? 'bg-green-900/30 text-green-300' :
                        order.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
