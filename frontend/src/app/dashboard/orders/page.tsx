'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { ShoppingCart, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Invalid user data:', err);
      }
    }

    // Fetch orders
    fetchOrders(token);
  }, [router]);

  const fetchOrders = async (token: string | null) => {
    try {
      if (!token) return;
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-400" />;
      case 'pending':
        return <Clock className="text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="text-red-400" />;
      default:
        return <ShoppingCart className="text-amber-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />
      <div className="flex">
        {sidebarOpen && <DashboardSidebar isOpen={sidebarOpen} user={user} />}
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">My Orders</h1>
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition">
                New Service
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-12 text-center">
                <ShoppingCart size={48} className="text-amber-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No Orders Yet</h2>
                <p className="text-amber-100 mb-6">You haven't ordered any services yet.</p>
                <button onClick={() => router.push('/services')} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition">
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-6 hover:border-amber-400 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center justify-center w-12 h-12 bg-amber-500/20 rounded-lg">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{order.serviceName}</h3>
                          <p className="text-amber-200/70 text-sm">Order ID: {order.id}</p>
                          <p className="text-amber-100 mt-1">₹{order.amount}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-300 font-bold capitalize">{order.status}</p>
                        <p className="text-amber-200/70 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                        <button className="mt-2 px-3 py-1 text-amber-400 hover:text-amber-300 text-sm font-bold transition">
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
