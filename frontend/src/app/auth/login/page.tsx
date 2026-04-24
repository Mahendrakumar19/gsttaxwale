'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-redirect disabled as per request
    /*
    const adminToken = adminAuth.getAdminToken();
    const adminUser = adminAuth.getAdminUser();
    
    if (adminToken && adminUser?.role === 'admin') {
      router.push('/admin/dashboard');
    }
    */
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data.data;
      
      // Store user credentials in sessionStorage for temporary sessions
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('userRole', user.role || 'user');

      // If admin, also store in admin-specific storage
      if (user.role === 'admin') {
        adminAuth.setAdminToken(token);
        adminAuth.setAdminUser(user);
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-orange-600">GST Tax Wale</h1>
          <p className="mt-2 text-gray-900">GST & Income Tax Filing Services</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="px-4 py-3 text-red-600 border border-red-200 rounded bg-red-50">
              {error}
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              placeholder="Enter your password"
              className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <a href="/auth/forgot-password" className="block font-semibold text-blue-600 hover:text-blue-700 text-sm">
            Forgot your password?
          </a>
          <p className="text-xs text-gray-500">
            New accounts are created by admin only.{' '}
            <a href="/contact" className="text-blue-600 hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
}
