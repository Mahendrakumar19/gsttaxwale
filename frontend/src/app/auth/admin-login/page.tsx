'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in as admin
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data.data;

      // Check if user is admin
      if (user.role !== 'admin') {
        setError('Only admin users can access the admin panel. Please use regular login.');
        setLoading(false);
        return;
      }

      // Store admin credentials
      localStorage.setItem('token', token);
      localStorage.setItem('adminToken', token);
      adminAuth.setAdminToken(token);
      adminAuth.setAdminUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', 'admin');

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border border-purple-200">
        <div className="mb-8 text-center">
          <img src="/gsttaxwale_logo.svg" alt="GST Tax Wale" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-purple-900">Admin Login</h1>
          <p className="mt-2 text-gray-600">Administration Panel</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-6">
          {error && (
            <div className="px-4 py-3 text-red-700 border border-red-300 rounded-lg bg-red-50">
              <p className="font-medium">Login Failed</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Admin Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white text-gray-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Admin Login'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Not an admin?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium transition">
              Regular Login
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Note:</span> This page is for admin users only. If you don't have admin credentials, please contact the administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
