"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
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
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Authenticated</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Sync</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 rounded-full border border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest">{status || 'Unknown'}</span>
          </div>
        );
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black tracking-widest text-xs uppercase">Fetching Transaction Stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-widest">Revenue Hub</span>
            <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${refreshing ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${refreshing ? 'bg-blue-500 animate-ping' : 'bg-slate-300'}`} />
               <span className="text-[9px] font-black uppercase tracking-tight">{refreshing ? 'Refreshing...' : 'Live Feed'}</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Customer Orders</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time stream of service purchases and payment statuses</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Hash</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Identity</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Value</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Entity</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="text-right px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-8 py-6">
                     <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase">#{o.id.substring(0, 8)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900 tracking-tight">{o.service?.title || o.serviceId || 'Generic Service'}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{o.service?.category || 'Internal'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-lg font-black text-slate-900 tracking-tighter">₹{o.amount?.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    {getStatusBadge(o.status)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{o.customer?.name || o.guestName || 'Guest Participant'}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{o.customer?.email || o.guestEmail}</span>
                      {o.guestPan && (
                         <span className="mt-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded border border-blue-100 w-fit">PAN: {o.guestPan}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-slate-600">{new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {o.status !== 'paid' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'paid')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black rounded-xl transition shadow-lg shadow-green-500/20 uppercase tracking-widest active:scale-95"
                        >
                          Approve
                        </button>
                      )}
                      {o.status !== 'pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'pending')}
                          className="px-4 py-2 bg-slate-900 hover:bg-amber-600 text-white text-[10px] font-black rounded-xl transition shadow-xl uppercase tracking-widest active:scale-95"
                        >
                          Revert
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
          <div className="text-center py-24 bg-slate-50/50">
            <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">📊</div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">No Transactions</h3>
            <p className="text-slate-500 font-medium">Orders will manifest here upon customer checkout</p>
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Transaction Ledger v4.0 • Real-time Sync Active</p>
      </div>
    </div>
  );
}
  );
}
