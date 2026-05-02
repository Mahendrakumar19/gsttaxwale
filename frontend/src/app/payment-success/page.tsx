'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Download, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const search = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const orderId = search.get('orderId');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/orders/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrder(response.data.data.order);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-20">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-200 rounded-full animate-pulse"></div>
              <CheckCircle size={100} className="text-green-600 relative z-10" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600">Your service has been activated</p>
        </div>

        {/* Order Details Card */}
        {!loading && order && (
          <div className="bg-white rounded-xl shadow-lg border border-green-200 p-8 mb-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-600 text-sm mb-1">Order ID</p>
                <p className="text-lg font-bold text-gray-900">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Amount Paid</p>
                <p className="text-lg font-bold text-green-600">₹{order.amount}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Service</p>
                <p className="text-lg font-bold text-gray-900">{order.serviceTitle}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Status</p>
                <p className="text-lg font-bold text-green-600 capitalize">{order.status}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600 text-sm mb-1">Payment Date</p>
                <p className="text-gray-900">{new Date(order.paidAt).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-700 mb-4">
                Your service has been activated and is ready to use. Check your email for access details and further instructions.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            <Eye size={20} />
            View Service
          </Link>
          <Link href="/dashboard/orders" className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium">
            <Download size={20} />
            My Orders
          </Link>
          <Link href="/" className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium">
            <ArrowRight size={20} />
            Home
          </Link>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="font-bold text-gray-900 mb-2">What's Next?</h3>
          <ul className="text-gray-700 space-y-2 text-sm">
            <li>✓ Access your service from the dashboard</li>
            <li>✓ Download documents and resources</li>
            <li>✓ Contact support if you need assistance: help@gsttaxwale.com</li>
            <li>✓ Track your order status anytime</li>
          </ul>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 mt-12 text-sm">
          <Link href="/refund-policy" className="text-blue-600 hover:text-blue-700 underline">Refund Policy</Link>
          <Link href="/shipping-policy" className="text-blue-600 hover:text-blue-700 underline">Delivery Policy</Link>
          <Link href="/contact" className="text-blue-600 hover:text-blue-700 underline">Support</Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
        <PaymentSuccessContent />
      </div>
    </Suspense>
  );
}
