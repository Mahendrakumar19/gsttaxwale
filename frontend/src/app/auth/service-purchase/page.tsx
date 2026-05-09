'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import api from '@/lib/api';
import { Mail, Phone, User, Lock } from 'lucide-react';

type AuthStep = 'details' | 'otp' | 'checkout';

function ServicePurchaseAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');

  const [step, setStep] = useState<AuthStep>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Details form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pan, setPan] = useState('');

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !phone) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      // Store user details in session
      sessionStorage.setItem('tempUser', JSON.stringify({
        name,
        email,
        phone,
        pan,
      }));

      // Send OTP to email
      const otpResponse = await api.post('/api/auth/send-service-purchase-otp', {
        email,
        phone,
      });

      if (otpResponse.data.success) {
        setOtpSent(true);
        setSuccess('OTP sent to your email address');
        setStep('otp');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!otp) {
      setError('OTP code is required');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/verify-service-purchase-otp', {
        email,
        phone,
        otp,
      });

      if (response.data.success) {
        // Store verification info for checkout
        sessionStorage.setItem('tempToken', response.data.data.tempToken);
        sessionStorage.setItem('tempUser', JSON.stringify({
          name,
          email,
          phone,
          pan,
          verified: true,
        }));

        setSuccess('OTP verified successfully!');
        setTimeout(() => {
          if (serviceId) {
            router.push(`/checkout?serviceId=${serviceId}&verified=true`);
          } else {
            router.push('/checkout?verified=true');
          }
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md px-6 py-12 mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <img src="/gsttaxwale_logo.svg" alt="GST Tax Wale" className="w-auto h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Secure Purchase</h1>
          <p className="text-gray-600 text-sm mt-2">Complete verification to proceed with checkout</p>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-8">
          <div className={`flex-1 h-1 rounded-full ${step === 'details' || step === 'otp' || step === 'checkout' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 h-1 rounded-full ${step === 'otp' || step === 'checkout' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 h-1 rounded-full ${step === 'checkout' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              ✓ {success}
            </div>
          )}

          {/* Step 1: Collect Details */}
          {step === 'details' && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number (10 digits)"
                  className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  PAN Number
                </label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="Enter your 10-digit PAN"
                  maxLength={10}
                  className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 mt-6"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <p className="text-xs text-center text-gray-600 mt-4">
                We'll send a verification code to your email address
              </p>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verify OTP</h2>
              <p className="text-sm text-gray-600 mb-6">Enter the verification code sent to {email}</p>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl letter-spacing text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                <p className="font-semibold mb-1">📧 Check your email for the OTP</p>
                <p className="text-xs">If you don't see it, check your spam folder</p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('details');
                  setOtp('');
                  setOtpSent(false);
                }}
                className="w-full py-2 text-blue-600 font-semibold border border-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                Back
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-gray-600 mt-6">
          ✓ Secure & encrypted | Your data is protected
        </p>
      </div>
    </div>
  );
}

export default function ServicePurchaseAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading secure purchase...</p>
        </div>
      </div>
    }>
      <ServicePurchaseAuthContent />
    </Suspense>
  );
}
