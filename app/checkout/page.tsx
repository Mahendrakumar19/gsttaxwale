'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface CheckoutSession {
  orderId: number;
  orderNo: string;
  amount: number;
  currency: string;
  service: {
    id: number;
    name: string;
    duration: string;
  };
  razorpay: {
    orderId: string;
    key: string;
    amount: number;
    email: string;
    name: string;
    description: string;
    prefill: {
      email: string;
      name: string;
    };
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');

  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!serviceId) {
      setError('No service selected');
      setLoading(false);
      return;
    }

    const fetchCheckout = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ serviceId: parseInt(serviceId) }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to create checkout session');
          return;
        }

        setSession(data.data);

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
      } catch (err) {
        setError('Failed to load checkout. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckout();
  }, [serviceId, router]);

  const handlePayment = async () => {
    if (!session || !window.Razorpay) {
      setError('Payment system not ready. Please refresh the page.');
      return;
    }

    setProcessing(true);

    const options = {
      key: session.razorpay.key,
      amount: session.razorpay.amount,
      currency: session.currency,
      order_id: session.razorpay.orderId,
      name: 'Tax Platform',
      description: session.razorpay.description,
      prefill: session.razorpay.prefill,
      theme: {
        color: '#2563eb',
      },
      handler: async function (response: any) {
        try {
          const token = localStorage.getItem('token');
          const verifyRes = await fetch('/api/checkout', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              orderId: session.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyRes.ok) {
            // Payment successful
            router.push(`/dashboard?success=true&orderId=${session.orderId}`);
          } else {
            setError(verifyData.error || 'Payment verification failed');
            setProcessing(false);
          }
        } catch (err) {
          setError('Payment verification error. Please contact support.');
          setProcessing(false);
        }
      },
      modal: {
        ondismiss: function () {
          setProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Loading checkout...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Checkout</h1>
          <p className="text-red-600 mb-6">{error || 'Service not found'}</p>
          <Link href="/services" className="text-blue-600 hover:underline">
            ← Back to services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-blue-100 mt-2">Complete your order</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Order Summary */}
            <div className="mb-8 pb-8 border-b">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Service</span>
                  <span className="font-semibold text-slate-900">
                    {session.service.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-semibold text-slate-900">
                    {session.service.duration}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{session.amount}</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors Text-lg"
            >
              {processing ? 'Processing...' : `Pay ₹${session.amount}`}
            </button>

            <p className="text-sm text-slate-500 text-center mt-4">
              Secured by Razorpay • 100% safe and secure payment
            </p>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-4 border-t">
            <Link href="/services" className="text-sm text-blue-600 hover:underline">
              ← Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
