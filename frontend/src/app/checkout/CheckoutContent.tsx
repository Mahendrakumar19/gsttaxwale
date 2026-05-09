"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutContent() {
  const search = useSearchParams();
  const serviceId = search.get('serviceId');
  const verified = search.get('verified') === 'true';
  const router = useRouter();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userPan, setUserPan] = useState('');

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, []);

  // Load service and user info
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        
        // Get user info - prioritize tempUser from OTP flow
        const tempUserJson = sessionStorage.getItem('tempUser');
        if (tempUserJson) {
          const user = JSON.parse(tempUserJson);
          setUserEmail(user.email || '');
          setUserName(user.name || '');
          setUserPhone(user.phone || '');
          setUserPan(user.pan || '');
        } else {
          // Try to get from regular auth
          const token = sessionStorage.getItem('token') || localStorage.getItem('token');
          if (token) {
            try {
              const userRes = await api.get('/api/auth/me');
              if (userRes.data?.data?.user) {
                const user = userRes.data.data.user;
                setUserEmail(user.email || '');
                setUserName(user.name || '');
                setUserPhone(user.phone || '');
                setUserPan(user.pan || '');
              }
            } catch (err) {
              console.warn('Could not fetch user info:', err);
            }
          }
        }

        // Get service details
        if (serviceId) {
          const serviceRes = await api.get(`/api/services/${serviceId}`);
          if (serviceRes.data?.data?.service) {
            setService(serviceRes.data.data.service);
          }
        }
      } catch (err: any) {
        console.error('Load failed:', err);
        setError('Failed to load checkout details');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [serviceId]);

  const handlePayment = async () => {
    try {
      if (!service || !userEmail || !userName || !userPhone) {
        setError('Please provide all required information');
        return;
      }

      if (!window.Razorpay) {
        setError('Payment gateway not loaded. Please refresh and try again.');
        return;
      }

      setProcessing(true);
      setError('');

      // Create order on backend
      const createOrderRes = await api.post('/api/orders', {
        serviceId: service.id,
        notes: service.title,
        customerEmail: userEmail,
        customerName: userName,
        customerPhone: userPhone,
        customerPan: userPan,
        referralCode: sessionStorage.getItem('referralCode') || undefined,
      });

      if (!createOrderRes.data?.data?.orderId) {
        throw new Error('Failed to create order');
      }

      const { orderId, razorpayOrderId, key } = createOrderRes.data.data;

      const finalAmount = (service.discountedPrice > 0 && service.discountedPrice < service.price) 
        ? service.discountedPrice 
        : service.price;

      // Razorpay options
      const options = {
        key: key || process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_live_3xTyUrGlyCxrLB',
        amount: Math.round(finalAmount * 100), // Convert to paise
        currency: 'INR',
        name: 'GST Tax Wale',
        description: service.title,
        order_id: razorpayOrderId,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: '#2563EB',
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyRes = await api.post('/api/orders/verify', {
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              // Clear temp auth
              sessionStorage.removeItem('tempToken');
              sessionStorage.removeItem('tempUser');
              
              router.push(`/checkout/success?orderId=${orderId}`);
            } else {
              setError('Payment verification failed');
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            setError('Payment verification failed. Please contact support.');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-slate-600">Loading checkout details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Service not found</h2>
          <p className="text-slate-600 mb-6">The service you are trying to purchase could not be found or is no longer available.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Order Summary */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{service.title}</h3>
                    <p className="text-slate-500 text-sm mt-1">{service.description}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-slate-600 mb-2">
                    <span>Base Price</span>
                    <span className={service.discountedPrice > 0 ? 'line-through' : ''}>
                      ₹{service.price?.toLocaleString()}
                    </span>
                  </div>
                  {service.discountedPrice > 0 && (
                    <div className="flex justify-between text-green-600 mb-2 font-medium">
                      <span>Discounted Price</span>
                      <span>₹{service.discountedPrice?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 mb-2">
                    <span>Processing Fee</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                    <span className="text-lg font-bold text-slate-900">Total Payable</span>
                    <span className="text-3xl font-black text-blue-600">
                      ₹{(service.discountedPrice > 0 ? service.discountedPrice : service.price)?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="font-bold text-lg">Secure Checkout</h3>
              </div>
              <ul className="space-y-3 text-sm text-blue-50">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-200 rounded-full"></span>
                  Verified 256-bit SSL encrypted connection
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-200 rounded-full"></span>
                  Official GST Tax Wale compliance service
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-200 rounded-full"></span>
                  Full support and documentation assistance
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Billing & Payment */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Billing Information</h2>
              
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-slate-900 font-semibold">{userName || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-slate-900 font-semibold">{userEmail || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-slate-900 font-semibold">{userPhone || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">PAN Number</p>
                    <p className="text-slate-900 font-semibold font-mono uppercase">{userPan || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing || !verified}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100 active:scale-95 text-lg"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Initializing Payment...
                  </span>
                ) : (
                  `Pay ₹${(service.discountedPrice > 0 ? service.discountedPrice : service.price)?.toLocaleString()} Now`
                )}
              </button>

              {!verified && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 text-center flex items-center justify-center gap-2 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Identity verification required to proceed
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6 mx-auto mb-2 opacity-50 grayscale hover:grayscale-0 transition cursor-help" title="Payments powered by Razorpay" />
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Powered by Razorpay Secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
