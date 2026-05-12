'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, User, Mail, Phone, Eye, EyeOff, Check, Copy, Shield, Key } from 'lucide-react';
import { adminAuth } from '@/lib/adminAuth';

export default function CreateCustomerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pan: '',
    dateOfBirth: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCustomer, setCreatedCustomer] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const adminToken = adminAuth.getAdminToken();
    const adminUser = adminAuth.getAdminUser();
    if (!adminToken || !adminUser || adminUser.role !== 'admin') {
      router.push('/auth/admin-login');
      return;
    }
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

    try {
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        setError('Name, email, phone and password are required');
        setLoading(false);
        return;
      }

      const response = await api.post('/api/admin/users', {
        ...formData,
        role: 'user',
        created_by_admin: true
      });

      if (response.data.success) {
        setCreatedCustomer(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer');
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

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/admin/customers" className="text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-2 transition">
            <ArrowLeft size={20} />
            Back to Customers
          </Link>
          <div className="flex items-center gap-2 text-slate-400 text-sm italic">
            <Shield size={14} />
            Secure Admin Action
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 pt-10">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 text-white">
              <User size={32} />
            </div>
            Create New Customer
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Register a new client and set up their credentials</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <User size={120} />
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-red-100 p-1.5 rounded-full text-red-600">!</div>
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Full Name *</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Mahendra Kumar"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Email Address *</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="customer@example.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Mobile Number *</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">PAN Number</label>
                      <input
                        type="text"
                        name="pan"
                        value={formData.pan}
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                        placeholder="ABCDE1234F"
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 uppercase"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Login Password *</label>
                    <div className="relative group">
                      <Key className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Set a password for the user"
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 italic ml-1 uppercase font-bold tracking-widest">Note: Keep this password safe. You won't see it again after saving.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !!createdCustomer}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg rounded-2xl hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5 transition-all disabled:opacity-50 uppercase tracking-widest"
                  >
                    {loading ? 'Creating Account...' : createdCustomer ? 'Account Created' : 'Create Customer Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Result / Instructions Section */}
          <div className="lg:col-span-2">
            {!createdCustomer ? (
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white h-full flex flex-col justify-between shadow-2xl">
                <div>
                  <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">Admin Guide</h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold border border-blue-500/30">1</div>
                      <p className="text-slate-300 text-sm leading-relaxed">Fill in the customer's legal name, email and mobile number correctly for GST compliance.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold border border-indigo-500/30">2</div>
                      <p className="text-slate-300 text-sm leading-relaxed">Set a secure password. You should manually share this password with the user as it is hashed for security.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400 font-bold border border-purple-500/30">3</div>
                      <p className="text-slate-300 text-sm leading-relaxed">The system will auto-generate a Referral Code and Reference Number for the new user.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-800">
                  <div className="flex items-center gap-3 text-amber-400 bg-amber-400/10 p-4 rounded-xl border border-amber-400/20">
                    <Shield size={24} />
                    <p className="text-xs font-medium leading-tight">Data entered here is directly stored in the secure MySQL production database.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-600 rounded-[2rem] p-8 text-white h-full flex flex-col shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-white p-2 rounded-xl text-green-600">
                    <Check size={32} />
                  </div>
                  <h3 className="text-3xl font-black uppercase">Success</h3>
                </div>
                
                <div className="space-y-5 flex-1">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <p className="text-xs font-bold uppercase opacity-60 mb-1">Customer Name</p>
                    <p className="text-xl font-black">{createdCustomer.user.name}</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <p className="text-xs font-bold uppercase opacity-60 mb-1">Email / Username</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-bold">{createdCustomer.credentials.email}</p>
                      <button onClick={() => copyToClipboard(createdCustomer.credentials.email, 'email')} className="hover:text-amber-300 transition">
                        {copiedField === 'email' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <p className="text-xs font-bold uppercase opacity-60 mb-1">Password</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-bold tracking-widest">{createdCustomer.credentials.password}</p>
                      <button onClick={() => copyToClipboard(createdCustomer.credentials.password, 'password')} className="hover:text-amber-300 transition">
                        {copiedField === 'password' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <p className="text-xs font-bold uppercase opacity-60 mb-1">Reference No.</p>
                    <p className="text-lg font-mono font-bold">{createdCustomer.user.reference_number}</p>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/admin/customers')}
                  className="mt-8 bg-white text-green-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition shadow-xl"
                >
                  Done & Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
