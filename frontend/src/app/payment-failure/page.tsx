'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { XCircle, RefreshCw, HelpCircle, Mail } from 'lucide-react';
import Link from 'next/link';

function PaymentFailureContent() {
  const search = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const error = search.get('error') || 'Payment processing failed';
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

  const handleRetry = () => {
    if (order) {
      router.push(`/checkout?serviceId=${order.serviceId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-20">
        {/* Failure Animation */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-200 rounded-full animate-pulse"></div>
              <XCircle size={100} className="text-red-600 relative z-10" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-xl text-gray-600">Unfortunately, we couldn't process your payment</p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-red-900 mb-2">Error Details:</h3>
            <p className="text-red-800">{error}</p>
          </div>

          {!loading && order && (
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Order ID</p>
                <p className="text-lg font-mono text-gray-900 bg-gray-100 p-2 rounded">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Service</p>
                <p className="text-gray-900">{order.serviceTitle}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Amount</p>
                <p className="text-lg font-bold text-gray-900">₹{order.amount}</p>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 mt-6 pt-6">
            <h3 className="font-bold text-gray-900 mb-3">Common Issues:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Insufficient funds in your account</li>
              <li>• Card/payment method not active or expired</li>
              <li>• Transaction limit exceeded</li>
              <li>• Incorrect card details (CVV, expiry date)</li>
              <li>• Bank server temporarily unavailable</li>
              <li>• UPI payment timeout or cancellation</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <RefreshCw size={20} />
            Try Another Payment Method
          </button>
          <Link href="/contact" className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium">
            <Mail size={20} />
            Contact Support
          </Link>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex gap-4">
            <HelpCircle size={24} className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">What You Can Do:</h3>
              <ol className="text-gray-700 space-y-2 text-sm list-decimal list-inside">
                <li>Try again with a different payment method</li>
                <li>Contact your bank/payment provider for transaction status</li>
                <li>Check if the amount was deducted (refund takes 5-7 days)</li>
                <li>Use an alternative card or payment option</li>
                <li>Contact our support team for assistance</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Support Box */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">Our support team is here to help you resolve this issue.</p>
          <div className="space-y-2 text-sm text-gray-700">
            <p>📧 <strong>Email:</strong> help@gsttaxwale.com</p>
            <p>📞 <strong>Phone:</strong> +91-XXXXXXXXXX</p>
            <p>💬 <strong>Live Chat:</strong> Available 9 AM - 6 PM IST</p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 mt-12 text-sm">
          <Link href="/refund-policy" className="text-blue-600 hover:text-blue-700 underline">Refund Policy</Link>
          <Link href="/payment-terms" className="text-blue-600 hover:text-blue-700 underline">Payment Terms</Link>
          <Link href="/" className="text-blue-600 hover:text-blue-700 underline">Home</Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailure() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PaymentFailureContent />
    </Suspense>
  );
}
