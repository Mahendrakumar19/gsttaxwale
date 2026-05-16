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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-md border border-green-200 text-[10px] font-bold uppercase tracking-wider">
            Processed
          </div>
        );
      case 'pending':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
            Pending
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-500 rounded-md border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
            {status || 'Unknown'}
          </div>
        );
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Transaction Ledger...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Monitoring platform-wide service acquisitions and settlements</p>
        </div>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${refreshing ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
           <span className={`w-1.5 h-1.5 rounded-full ${refreshing ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
           <span>{refreshing ? 'Refreshing Matrix' : 'Audit Sync Active'}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference ID</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Item</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valuation</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settlement</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Counterparty</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="text-right px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                     <span className="font-mono text-[10px] font-bold text-slate-300 uppercase tracking-tighter">ORD-{o.id.substring(0, 6)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-900 leading-none tracking-tight">{o.service?.title || o.serviceId || 'Standard Unit'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1.5 tracking-widest">{o.service?.category || 'General'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-900 tracking-tight">₹{o.amount?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-5">
                    {getStatusBadge(o.status)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-bold text-slate-900 tracking-tight">{o.customer?.name || o.guestName || 'Terminal User'}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{o.customer?.email || o.guestEmail || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {o.status !== 'paid' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'paid')}
                          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-bold rounded-lg transition-all uppercase tracking-widest shadow-sm"
                        >
                          Settle
                        </button>
                      )}
                      {o.status !== 'pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'pending')}
                          className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 text-[9px] font-bold rounded-lg transition-all uppercase tracking-widest"
                        >
                          Defer
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
            <div className="w-16 h-16 bg-white border border-slate-100 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">📊</div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Transactions Registered</h3>
            <p className="text-xs text-slate-500 mt-1">Ready for financial ingestion</p>
          </div>
        )}
      </div>

      <div className="mt-12 text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Institutional Grade Transaction Ledger • Secure-Stream Active</p>
      </div>
    </div>
  );
}
