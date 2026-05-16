'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Mail, Phone as PhoneIcon, Lock } from 'lucide-react';
import OTPInput from '@/components/OTPInput';
import api from '@/lib/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [identifier, setIdentifier] = useState(''); // Store the email/phone used
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email && !phone) {
        setError('Please enter email or phone number');
        setLoading(false);
        return;
      }

      const target = email || phone;
      setIdentifier(target);

      await api.post('/api/auth/send-reset-otp', {
        identifier: target
      });

      setStep('otp');
      setSuccess(`OTP sent successfully to ${target}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!otp || otp.length < 6) {
        setError('Please enter complete OTP');
        setLoading(false);
        return;
      }

      await api.post('/api/auth/verify-reset-otp', {
        identifier,
        otp,
      });

      setStep('reset');
      setSuccess('OTP verified. Please set your new password.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
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

      await api.post('/api/auth/reset-password', {
        identifier,
        otp,
        newPassword,
      });

      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Verification Required</h2>
                <p className="text-slate-500 text-sm font-medium mt-2">
                  We've sent a 6-digit code to {email || phone}. <br />Please enter it below to continue.
                </p>
              </div>

              <div className="py-4">
                <OTPInput onComplete={(val) => setOtp(val)} disabled={loading} />
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length < 6}
                  className="w-full py-4 bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition shadow-xl shadow-slate-900/10"
                >
                  {loading ? 'Verifying Identity...' : 'Confirm Verification'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full py-4 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest text-xs rounded-2xl transition"
                >
                  Back to Email/Phone
                </button>
              </div>

              <div className="text-center">
                <p className="text-slate-400 text-xs font-medium">
                  Didn't receive the code?{' '}
                  <button onClick={handleSendOTP} className="text-blue-600 font-bold hover:underline">Resend OTP</button>
                </p>
              </div>
            </div>
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

