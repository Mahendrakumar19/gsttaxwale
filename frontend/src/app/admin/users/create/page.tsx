'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, User, Mail, Phone, Copy, Check } from 'lucide-react';

export default function CreateUserPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    referral_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          router.push('/auth/login');
          return;
        }

        const user = JSON.parse(userData);
        if (user.role !== 'admin') {
          router.push('/');
          return;
        }

        setAdminUser(user);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/auth/login');
      }
    };

    checkAdmin();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Name, email, and phone are required');
        setLoading(false);
        return;
      }

      // Call API to create user
      const response = await api.post('/api/admin/users', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        referral_code: formData.referral_code || undefined,
      });

      if (response.data.success && response.data.data.user) {
        setCreatedUser(response.data.data);
        setSuccess('User created successfully!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          referral_code: '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!adminUser) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/admin/users" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <ArrowLeft size={18} />
            Back to Users
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <User size={32} className="text-blue-600" />
          Create New User
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">User Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="px-4 py-3 text-red-600 border border-red-200 rounded bg-red-50">
                  {error}
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  name="referral_code"
                  value={formData.referral_code}
                  onChange={handleChange}
                  placeholder="If referred by another user"
                  className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="mt-2 text-xs text-gray-500">
                  User will be linked to referrer if code is valid
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Creating User...' : 'Create User'}
              </button>
            </form>
          </div>

          {/* Created User Info */}
          {createdUser && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Check size={24} className="text-green-600" />
                <h2 className="text-xl font-bold text-green-900">User Created Successfully!</h2>
              </div>

              <div className="space-y-4 bg-white p-4 rounded-lg border border-green-200">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Name</p>
                  <p className="text-gray-900 font-medium">{createdUser.user.name}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                  <div className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                    <p className="text-gray-900 font-mono text-sm break-all">{createdUser.user.email}</p>
                    <button
                      onClick={() => copyToClipboard(createdUser.user.email, 'email')}
                      className="text-blue-600 hover:text-blue-700 transition"
                      title="Copy"
                    >
                      {copiedField === 'email' ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Phone</p>
                  <div className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                    <p className="text-gray-900 font-mono text-sm">{createdUser.user.phone}</p>
                    <button
                      onClick={() => copyToClipboard(createdUser.user.phone, 'phone')}
                      className="text-blue-600 hover:text-blue-700 transition"
                      title="Copy"
                    >
                      {copiedField === 'phone' ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Temporary Password</p>
                  <div className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                    <p className="text-gray-900 font-mono text-sm">{createdUser.credentials.tempPassword}</p>
                    <button
                      onClick={() => copyToClipboard(createdUser.credentials.tempPassword, 'password')}
                      className="text-blue-600 hover:text-blue-700 transition"
                      title="Copy"
                    >
                      {copiedField === 'password' ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Reference Number</p>
                  <div className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                    <p className="text-gray-900 font-mono text-sm">{createdUser.user.reference_number}</p>
                    <button
                      onClick={() => copyToClipboard(createdUser.user.reference_number, 'ref')}
                      className="text-blue-600 hover:text-blue-700 transition"
                      title="Copy"
                    >
                      {copiedField === 'ref' ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Auto-Generated Referral Code</p>
                  <div className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                    <p className="text-gray-900 font-mono text-sm">{createdUser.user.referral_code}</p>
                    <button
                      onClick={() => copyToClipboard(createdUser.user.referral_code, 'referralcode')}
                      className="text-blue-600 hover:text-blue-700 transition"
                      title="Copy"
                    >
                      {copiedField === 'referralcode' ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-300">
                  <p className="text-xs text-gray-600 mb-4">
                    ✓ Credentials will be sent to the user's email<br />
                    ✓ User can login with their email and temporary password<br />
                    ✓ User should change password on first login
                  </p>

                  <button
                    onClick={() => {
                      setCreatedUser(null);
                      router.push('/admin/users');
                    }}
                    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    Back to Users List
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
