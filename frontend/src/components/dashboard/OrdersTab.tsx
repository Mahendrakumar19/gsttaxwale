'use client';

import { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface Order {
  id: string;
  serviceName: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  orderDate: string;
  notes?: string;
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/dashboard/overview');
      if (response.data?.recentOrders) {
        setOrders(response.data.recentOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Mock data for demo
      setOrders([
        {
          id: 'ORD-001',
          serviceName: 'GST Registration',
          amount: 2999,
          status: 'completed',
          orderDate: '2026-01-15',
        },
        {
          id: 'ORD-002',
          serviceName: 'Income Tax Filing',
          amount: 1499,
          status: 'processing',
          orderDate: '2026-01-10',
        },
        {
          id: 'ORD-003',
          serviceName: 'Company Registration',
          amount: 5999,
          status: 'pending',
          orderDate: '2026-01-08',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    totalValue: orders.reduce((sum, o) => sum + o.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders</h2>
        <p className="text-gray-600 mb-6">View all your service orders and payments</p>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatBox
          label="Total Orders"
          value={stats.total.toString()}
          icon="📦"
          color="from-blue-50 to-sky-50 border-blue-200"
        />
        <StatBox
          label="Completed"
          value={stats.completed.toString()}
          icon="✅"
          color="from-green-50 to-emerald-50 border-green-200"
        />
        <StatBox
          label="Pending"
          value={stats.pending.toString()}
          icon="⏳"
          color="from-orange-50 to-amber-50 border-orange-200"
        />
        <StatBox
          label="Total Value"
          value={`₹${stats.totalValue.toLocaleString()}`}
          icon="💳"
          color="from-purple-50 to-pink-50 border-purple-200"
        />
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">No orders yet</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💳 Payment History</h3>
        <div className="space-y-2 text-sm">
          {orders.slice(0, 3).map((order) => (
            <div
              key={order.id}
              className="flex justify-between items-center text-gray-700 py-2"
            >
              <span>{order.serviceName}</span>
              <span className="font-semibold">₹{order.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${color} border rounded-lg p-4`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-50 to-green-100 border-green-200';
      case 'processing':
        return 'from-blue-50 to-blue-100 border-blue-200';
      case 'pending':
        return 'from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  return (
    <div
      className={`bg-gradient-to-br ${getStatusColor(
        order.status
      )} border rounded-lg p-4 flex items-center justify-between hover:border-opacity-60 transition`}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white rounded-lg">{getStatusIcon(order.status)}</div>
        <div>
          <h4 className="font-semibold text-gray-900">{order.serviceName}</h4>
          <p className="text-sm text-gray-600">
            Order ID: {order.id} • {new Date(order.orderDate).toLocaleDateString()}
          </p>
          {order.notes && (
            <p className="text-xs text-gray-700 mt-1">{order.notes}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900">₹{order.amount.toLocaleString()}</p>
        <p className="text-xs text-gray-600 capitalize mt-1">{order.status}</p>
      </div>
    </div>
  );
}
