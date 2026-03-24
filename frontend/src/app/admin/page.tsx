"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { adminAuth } from '../../lib/adminAuth';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If already logged in as admin, redirect to dashboard
    const adminToken = adminAuth.getAdminToken();
    const adminUser = adminAuth.getAdminUser();
    if (adminToken && adminUser?.role === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`,
        { email, password }
      );

      const user = res.data?.data?.user;
      const token = res.data?.data?.token;

      // Only allow admin role
      if (user?.role !== 'admin') {
        setError('Only administrators can access this panel');
        return;
      }

      if (token && user) {
        adminAuth.setAdminToken(token);
        adminAuth.setAdminUser(user);
        router.push('/admin/dashboard');
      } else {
        setError('Login failed — invalid response from server');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-orange-500/50">
              ₹
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-100 mb-2">GST Tax Wale</h1>
          <p className="text-slate-400 text-sm">Admin Control Panel</p>
        </div>

        {/* Glass Card */}
        <div className="glassmorphic-dark p-8 rounded-2xl border border-slate-500/20 shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">Admin Login</h2>
          <p className="text-slate-400 text-sm text-center mb-8">Sign in to manage services and orders</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Email Address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-600/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/50 hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in to Admin Panel'}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-slate-600/30 text-center">
            <p className="text-xs text-slate-400">
              Admin access only. Unauthorized access is prohibited.
            </p>
          </div>
        </div>

        {/* Background hint */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Demo: admin@example.com
        </p>
      </div>
    </div>
  );
}
