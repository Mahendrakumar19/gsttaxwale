"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutContent() {
  const search = useSearchParams();
  const serviceId = search.get('serviceId');
  const router = useRouter();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Razorpay script loaded');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      toast.error('Payment gateway unavailable. Please try again.');
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Load service details and get user info from token
  useEffect(() => {
    if (!serviceId) return setLoading(false);
    let mounted = true;
    
    async function load() {
      try {
        // Get user info from token
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const userRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/users/me`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (mounted && userRes.data?.data?.user) {
              setUserEmail(userRes.data.data.user.email || '');
              setUserName(userRes.data.data.user.firstName || userRes.data.data.user.name || '');
            }
          } catch (err) {
            console.warn('Could not fetch user info:', err);
          }
        }

        // Get service details
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/services/${serviceId}`
        );
        if (mounted) setService(res.data.data.service);
      } catch (err) {
        console.error('Load failed:', err);
        toast.error('Failed to load service details');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [serviceId]);

  async function handleCreateOrder() {
    try {
      if (!service) return toast.error('Service not found');
      if (!window.Razorpay) return toast.error('Payment gateway not loaded');
      
      setProcessing(true);
      
      // Create order on backend
      const payload = {
        serviceId: service.id,
        amount: Math.round(service.price * 100), // Convert to paise
        description: service.title,
        customerEmail: userEmail || 'customer@example.com',
        customerName: userName || 'Guest Customer'
      };
      
      const createRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/orders`,
        payload,
        { headers: localStorage.getItem('authToken') ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` } : {} }
      );
      
      if (!createRes.data?.data?.orderId) {
        throw new Error('Invalid order response from server');
      }

      const orderId = createRes.data.data.orderId;
      const amount = createRes.data.data.amount;

      // Initialize Razorpay
      const razorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount, // Amount in paise
        currency: 'INR',
        name: process.env.NEXT_PUBLIC_RAZORPAY_MERCHANT_NAME || 'GST Tax Wale',
        description: service.title,
        order_id: orderId,
        prefill: {
          name: userName || 'Guest',
          email: userEmail || 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#2563EB' // Blue-600
        },
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyRes = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/orders/verify`,
              {
                orderId: orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              },
              { headers: localStorage.getItem('authToken') ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` } : {} }
            );

            if (verifyRes.data?.success) {
              toast.success('Payment successful! Redirecting...');
              setTimeout(() => {
                router.push(`/checkout/success?orderId=${orderId}&paymentId=${response.razorpay_payment_id}`);
              }, 1000);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();
    } catch (err: any) {
      console.error('Order creation failed:', err);
      toast.error(err.response?.data?.message || 'Payment initiation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-lg text-gray-600">Loading service details…</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center text-gray-600">
          <p className="mb-2 text-lg font-semibold">Service not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 mt-4 text-white transition rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Simple Hero with Checkout */}
      <section className="relative px-4 pt-20 pb-12 overflow-hidden">
        <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-blue-100/50 blur-3xl"></div>
        <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-green-100/50 blur-3xl"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <div className="text-5xl mb-4">💳</div>
            <h1 className="mb-3 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              Complete Your Purchase
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Secure, transparent, and instant. Powered by Razorpay. No hidden charges.
            </p>
          </div>
        </div>
      </section>

      {/* Main Checkout Section */}
      <section className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-8 border shadow-lg bg-white rounded-2xl border-gray-300">
            {/* Service Details */}
            <div className="mb-8">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">Order Summary</h2>
              
              <div className="pb-6 mb-6 space-y-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                    <p className="max-w-md mt-2 text-sm text-gray-600">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      ₹{service.price?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Service Features - FIXED COLORS */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm">Instant delivery & confirmation</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm">24/7 customer support included</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm">100% secure payment processing</span>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex items-center justify-between pt-4 pb-6 border-b border-gray-200">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{service.price?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* CTA Button - Now with Razorpay */}
            <button
              disabled={processing}
              onClick={handleCreateOrder}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition duration-300 flex items-center justify-center gap-2 ${
                processing
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white hover:shadow-lg hover:shadow-blue-600/50 active:scale-95'
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
                  Pay ₹{service.price?.toLocaleString()} with Razorpay
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="p-4 mt-6 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔐</span>
                <p className="text-sm text-gray-700">
                  Secured with 256-bit SSL encryption. Payments powered by Razorpay, India's trusted payment gateway.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Services */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.back()}
              className="text-sm transition text-gray-600 hover:text-blue-600"
            >
              ← Back to services
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
