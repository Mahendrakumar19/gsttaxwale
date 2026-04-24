'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface Order {
  id: number;
  orderNo: string;
  serialNumber?: string;
  status: string;
  amount: number;
  service?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          router.push('/login');
          return;
        }

        setUser(JSON.parse(userData));

        // Fetch user orders
        const res = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch orders');
        }

        const data = await res.json();
        setOrders(data.data?.orders || []);
      } catch (err) {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back, {user?.name}!</p>
            </div>
            <div className="space-x-4">
              <Link href="/services" className="text-blue-600 hover:underline">
                Services
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Full Name</p>
                <p className="text-slate-900 font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Email Address</p>
                <p className="text-slate-900 font-semibold">{user?.email}</p>
              </div>
              {user?.phone && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Phone Number</p>
                  <p className="text-slate-900 font-semibold">{user?.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-500">Member Since</p>
                <p className="text-slate-900 font-semibold">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
            <Link href="/settings" className="mt-6 inline-block text-blue-600 hover:underline">
              Edit Profile →
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-slate-500 text-sm font-medium">Total Orders</p>
              <p className="text-4xl font-bold text-blue-600">{orders.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-slate-500 text-sm font-medium">Total Spent</p>
              <p className="text-4xl font-bold text-green-600">
                ₹{orders.reduce((sum, order) => sum + (order.amount || 0), 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-slate-500 text-sm font-medium">Active Services</p>
              <p className="text-4xl font-bold text-purple-600">
                {orders.filter((o) => o.status === 'paid' || o.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 border-b">
            <h2 className="text-2xl font-bold text-slate-900">Your Orders</h2>
            <p className="text-slate-600 text-sm mt-1">
              View and manage all your orders and subscriptions
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 mb-4">No orders yet</p>
              <Link href="/services" className="text-blue-600 hover:underline">
                Browse our services
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {order.orderNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {order.service?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        ₹{order.amount}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Links */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Link
            href="/services"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2">Browse Services</h3>
            <p className="text-slate-600 text-sm">Explore all available tax and accounting services</p>
          </Link>
          <Link
            href="/contact"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2">Contact Support</h3>
            <p className="text-slate-600 text-sm">Need help? Reach out to our support team</p>
          </Link>
          <Link
            href="/settings"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2">Account Settings</h3>
            <p className="text-slate-600 text-sm">Update your profile and preferences</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
