"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Check, ShoppingCart, AlertCircle } from 'lucide-react';

export default function ServiceDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadService();
  }, [id]);

  async function loadService() {
    try {
      setError('');
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/services/${id}`
      );
      setService(res.data.data?.service || null);
      if (!res.data.data?.service) {
        setError('Service not found');
      }
    } catch (err: any) {
      setError('Failed to load service: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/auth/login?redirect=/services/${id}`);
      return;
    }

    setSubscribing(true);
    try {
      // Create order first
      const orderRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders`,
        {
          serviceId: service.id,
          amount: service.price,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderRes.data.data?.order;
      if (!order) throw new Error('Failed to create order');

      // Initialize Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_test_key',
          amount: order.amount * 100, // Convert to paise
          currency: 'INR',
          name: 'GST Tax Wale',
          description: service.title,
          order_id: order.razorpayOrderId,
          handler: async (response: any) => {
            try {
              // Verify and complete payment
              await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/verify`,
                {
                  orderId: order.id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              router.push('/checkout/success');
            } catch (err) {
              setError('Payment verification failed');
            }
          },
          prefill: {
            email: localStorage.getItem('userEmail') || '',
            contact: localStorage.getItem('userPhone') || '',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
    } catch (err: any) {
      setError('Failed to initiate payment: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubscribing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-slate-300 text-lg">Loading service details…</div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <nav className="bg-slate-800/50 border-b border-amber-500/30 px-6 py-4 sticky top-0">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <Link href="/services" className="text-amber-400 hover:text-amber-300 flex items-center gap-2 transition">
              <ArrowLeft size={20} />
              Back to Services
            </Link>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-6 text-red-300 flex items-center gap-3">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-bold text-lg">Error</h3>
              <p>{error || 'Service not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const features = Array.isArray(service.features) 
    ? service.features 
    : (typeof service.features === 'string' 
        ? (() => { try { return JSON.parse(service.features || '[]'); } catch { return []; } })() 
        : []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/50 border-b border-amber-500/30 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/services" className="text-amber-400 hover:text-amber-300 flex items-center gap-2 transition">
            <ArrowLeft size={20} />
            Back to Services
          </Link>
          <h2 className="text-amber-400 font-bold text-lg">GST Tax Wale</h2>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Category Badge */}
              <div className="inline-block">
                <span className="bg-green-600/30 text-green-300 px-4 py-2 rounded-full text-sm font-semibold border border-green-500/50">
                  Professional Service
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-3">{service.title}</h1>
                <p className="text-slate-300 text-lg leading-relaxed">{service.description}</p>
              </div>

              {/* Features */}
              <div className="bg-slate-800/40 border border-slate-600/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-amber-400 mb-4">What's Included</h3>
                <ul className="space-y-3">
                  {features.length > 0 ? (
                    features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-100">
                        <Check size={20} className="text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">No features listed</li>
                  )}
                </ul>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-600/20 rounded-lg p-4 border border-blue-500/30">
                  <p className="text-blue-300 text-sm mb-1">Processing Time</p>
                  <p className="text-white font-bold text-lg">2-5 Business Days</p>
                </div>
                <div className="bg-purple-600/20 rounded-lg p-4 border border-purple-500/30">
                  <p className="text-purple-300 text-sm mb-1">Support Available</p>
                  <p className="text-white font-bold text-lg">24/7 Email & Chat</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-8 shadow-2xl border border-amber-500/50">
              <div className="space-y-6">
                {/* Price */}
                <div>
                  <p className="text-amber-100 text-sm mb-2">Service Price</p>
                  <div className="text-5xl font-bold text-white">
                    ₹{Number(service.price).toLocaleString()}
                  </div>
                  <p className="text-amber-100 text-sm mt-2">One-time payment</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                    {error}
                  </div>
                )}

                {/* Subscribe Button */}
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="w-full bg-white text-amber-600 font-bold py-4 rounded-lg hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingCart size={20} />
                  {subscribing ? 'Processing…' : 'Subscribe Now'}
                </button>

                {/* Features Summary */}
                <div className="space-y-2 pt-4 border-t border-amber-300/30">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Check size={16} className="text-green-300" />
                    <span>Instant Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Check size={16} className="text-green-300" />
                    <span>30-Day Money Back</span>
                  </div>
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Check size={16} className="text-green-300" />
                    <span>Expert Support</span>
                  </div>
                </div>

                {/* Need Login */}
                {!localStorage.getItem('token') && (
                  <p className="text-amber-100 text-xs text-center">
                    You'll be redirected to login to subscribe
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
