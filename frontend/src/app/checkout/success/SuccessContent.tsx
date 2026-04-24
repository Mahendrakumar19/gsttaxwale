'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function SuccessContent() {
  const search = useSearchParams();
  const router = useRouter();
  const orderId = search.get('orderId');
  const paymentId = search.get('paymentId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${orderId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        
        if (res.data?.data?.order) {
          setOrder(res.data.data.order);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center">
      <section className="w-full px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="p-8 bg-white rounded-2xl border border-gray-300 shadow-lg">
            {/* Success Icon */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <svg 
                  className="w-10 h-10 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-green-600 mb-2">
                Payment Successful!
              </h1>
              <p className="text-lg text-gray-600">
                Thank you for your purchase. Your service is now active.
              </p>
            </div>

            {/* Order Details */}
            {loading ? (
              <div className="text-center text-gray-600 py-6">Loading order details...</div>
            ) : order ? (
              <div className="space-y-6 py-6 border-t border-b border-gray-200 my-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order ID</p>
                    <p className="text-lg font-semibold text-gray-900">{orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                    <p className="text-lg font-semibold text-blue-600">₹{order.amount?.toLocaleString()}</p>
                  </div>
                </div>

                {paymentId && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment ID</p>
                    <p className="font-mono text-sm text-gray-700 break-all">{paymentId}</p>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex gap-3">
                    <span className="text-xl">ℹ️</span>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">What's Next?</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>✓ Your service is now active</li>
                        <li>✓ Check your email for confirmation</li>
                        <li>✓ Access your dashboard to manage services</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition duration-300"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/services')}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-gray-900 bg-gray-100 hover:bg-gray-200 transition duration-300"
              >
                Browse More Services
              </button>
            </div>

            {/* Receipt Note */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex gap-3">
                <span className="text-xl">📧</span>
                <p className="text-sm text-gray-600">
                  A detailed receipt has been sent to your registered email. 
                  You can also download it from your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">
              Need help? <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => router.push('/contact')}>Contact our support team</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
