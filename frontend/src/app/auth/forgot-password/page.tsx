'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email && !phone) {
        setError('Please enter email or phone number');
        setLoading(false);
        return;
      }

      const response = await api.post('/api/auth/forgot-password', {
        email: email || undefined,
        phone: phone || undefined,
      });

      if (response.data.data.userId) {
        setUserId(response.data.data.userId);
        setStep('otp');
        setSuccess('OTP sent successfully. Check your email.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!otp) {
        setError('Please enter OTP');
        setLoading(false);
        return;
      }

      const response = await api.post('/api/auth/verify-password-otp', {
        userId,
        code: otp,
      });

      if (response.data.success) {
        setStep('reset');
        setSuccess('OTP verified. Please set your new password.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!newPassword || !confirmPassword) {
        setError('Please enter new password and confirmation');
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      const response = await api.post('/api/auth/reset-password', {
        userId,
        code: otp,
        newPassword,
      });

      if (response.data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              {step === 'email' && 'Enter your email or phone to continue'}
              {step === 'otp' && 'Enter the OTP sent to you'}
              {step === 'reset' && 'Set your new password'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Step 1: Email/Phone */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="text-center text-gray-600 text-sm">OR</div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-gray-500 text-xs mt-2">Check your email for the OTP</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError('');
                  setSuccess('');
                }}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition"
              >
                Back
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-gray-500 text-xs mt-2">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-700 text-sm">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-bold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

