"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function CheckoutContent() {
  const search = useSearchParams();
  const serviceId = search.get('serviceId');
  const router = useRouter();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!serviceId) return setLoading(false);
    let mounted = true;
    async function load() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/services/${serviceId}`
        );
        if (mounted) setService(res.data.data.service);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [serviceId]);

  async function handleCreateOrder() {
    try {
      if (!service) return alert('Service not found');
      setProcessing(true);
      const payload = { serviceId: service.id, amount: service.price, customer: { name: 'Guest' } };
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders`,
        payload
      );
      const order = res.data.data.order;
      const verify = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/verify`,
        { orderId: order.id, paymentRef: 'MOCK_PAY' }
      );
      if (verify.data.success) {
        router.push(`/checkout/success?orderId=${order.id}`);
      }
    } catch (err) {
      console.error('Order failed', err);
      alert('Order failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="text-lg text-slate-300">Loading service details…</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="text-center text-slate-400">
          <p className="mb-2 text-lg font-semibold">Service not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 mt-4 text-white transition rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Simple Hero with Checkout */}
      <section className="relative px-4 pt-20 pb-12 overflow-hidden">
        <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-amber-600/10 blur-3xl"></div>
        <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-green-600/10 blur-3xl"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <div className="text-5xl mb-4">💳</div>
            <h1 className="mb-3 text-4xl font-bold leading-tight text-white md:text-5xl">
              Complete Your purchase
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-300">
              Secure, transparent, and instant. No hidden charges.
            </p>
          </div>
        </div>
      </section>

      {/* Main Checkout Section */}
      <section className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-8 border shadow-2xl glassmorphic-dark rounded-2xl border-slate-500/30 bg-slate-900/50">
            {/* Service Details */}
            <div className="mb-8">
              <h2 className="mb-6 text-3xl font-bold text-white">Order Summary</h2>
              
              <div className="pb-6 mb-6 space-y-4 border-b border-slate-600/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                    <p className="max-w-md mt-2 text-sm text-slate-400">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text">
                      ₹{service.price?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Service Features */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-amber-400">✓</span>
                    <span className="text-sm">Instant delivery & confirmation</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-amber-400">✓</span>
                    <span className="text-sm">24/7 customer support included</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-amber-400">✓</span>
                    <span className="text-sm">100% secure payment processing</span>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex items-center justify-between pt-4 pb-6 border-b border-slate-600/30">
                <span className="font-semibold text-white">Total Amount</span>
                <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text">
                  ₹{service.price?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              disabled={processing}
              onClick={handleCreateOrder}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition duration-300 flex items-center justify-center gap-2 ${
                processing
                  ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white hover:shadow-lg hover:shadow-amber-600/50 active:scale-95'
              }`}
            >
              {processing ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Processing Payment…
                </>
              ) : (
                <>
                  <span>💳</span>
                  Pay Now (Mock Payment)
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="p-4 mt-6 border rounded-lg bg-amber-900/20 border-amber-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔐</span>
                <p className="text-xs text-slate-300">
                  Secured with 256-bit SSL encryption. This is a mock payment for demonstration purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Services */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.back()}
              className="text-sm transition text-slate-400 hover:text-amber-400"
            >
              ← Back to services
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
