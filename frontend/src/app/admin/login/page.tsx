'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';
import { AlertCircle, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-redirect disabled — require manual login always
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

      // Check if user is admin
      if (user.role !== 'admin') {
        setError('Access denied: This account does not have admin privileges');
        setLoading(false);
        return;
      }

      // Store admin credentials in sessionStorage (temporary session only)
      adminAuth.setAdminToken(token);
      adminAuth.setAdminUser(user);
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('userRole', 'admin');

      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="w-full max-w-md">
        {/* Header Badge */}
        <div className="text-center mb-6">
          <img src="/gsttaxwale_logo.svg" alt="GST Tax Wale" className="h-16 w-auto mx-auto mb-4 shadow-lg" />
          <p className="text-sm text-purple-700 font-medium">Admin Control Panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-purple-200 rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Administrator Login</h2>
            <p className="text-sm text-gray-500 mt-1">Restricted access. Authorized personnel only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex gap-3 px-4 py-3 text-red-700 border border-red-200 rounded-lg bg-red-50">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Login Failed</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-900">
                Admin Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-900">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 font-semibold text-white transition rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>
          </form>

          {/* Security notice */}
          <div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-xs text-purple-700">
              🔒 This page is for authorized administrators only. All login attempts are logged.
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              User Account?{' '}
              <a href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
