'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, User, Mail, Phone, Eye, EyeOff, Check, Copy, Shield, Key, MapPin, CreditCard } from 'lucide-react';
import { adminAuth } from '@/lib/adminAuth';

export default function CreateCustomerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pan: '',
    aadhaar: '',
    dateOfBirth: '',
    doorNo: '',
    buildingName: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    password: '',
    status: 'active',
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
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        created_by_admin: true,
      });
      if (response.data.success) {
        setCreatedCustomer(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const Field = ({ label, name, type = 'text', placeholder = '', required = false, maxLength, className = '', children }: any) => (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}{required && ' *'}</label>
      {children || (
        <input
          type={type}
          name={name}
          value={(formData as any)[name]}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-900"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/admin/customers" className="text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-2 transition">
            <ArrowLeft size={20} /> Back to Customers
          </Link>
          <div className="flex items-center gap-2 text-slate-400 text-sm italic">
            <Shield size={14} /> Secure Admin Action
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 pt-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 text-white">
              <User size={28} />
            </div>
            Create New Customer
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Register a new client with all their details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            {!createdCustomer ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-3">
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                {/* Personal Info */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User size={14} /> Personal Information
                  </h2>
                  <div className="space-y-4">
                    <Field label="Full Name" name="name" placeholder="e.g. Mahendra Kumar" required />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Email Address" name="email" type="email" placeholder="customer@example.com" required />
                      <Field label="Mobile Number" name="phone" type="tel" placeholder="9876543210" required />
                    </div>
                    <Field label="Date of Birth" name="dateOfBirth" type="date" />
                  </div>
                </div>

                {/* Tax & Identity */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CreditCard size={14} /> Tax & Identity
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">PAN Number</label>
                      <input
                        type="text"
                        name="pan"
                        value={formData.pan}
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-mono text-slate-900 uppercase"
                      />
                    </div>
                    <Field label="Aadhaar Number" name="aadhaar" placeholder="12-digit Aadhaar" maxLength={12} />
                  </div>
                </div>

                {/* Address */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xs font-black text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin size={14} /> Address
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Door/Flat No." name="doorNo" placeholder="e.g. 4B, Flat 202" />
                    <Field label="Building Name" name="buildingName" placeholder="e.g. Sunrise Apartments" />
                    <Field label="Street" name="street" placeholder="e.g. MG Road" />
                    <Field label="Area / Locality" name="area" placeholder="e.g. Koramangala" />
                    <Field label="City" name="city" placeholder="e.g. Bengaluru" />
                    <Field label="State" name="state" placeholder="e.g. Karnataka" />
                    <Field label="Pincode" name="pincode" placeholder="e.g. 560001" maxLength={6} />
                  </div>
                </div>

                {/* Login Credentials */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Key size={14} /> Login Credentials
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Set a strong password"
                          required
                          className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-900"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 italic uppercase font-bold tracking-widest">Note: Save this password — it won't be visible after creation.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Account Status</label>
                      <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-900">
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg rounded-2xl hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5 transition-all disabled:opacity-50 uppercase tracking-widest"
                >
                  {loading ? 'Creating Account...' : 'Create Customer Account'}
                </button>
              </form>
            ) : (
              /* Success state */
              <div className="bg-green-600 rounded-[2rem] p-10 text-white shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-white p-2 rounded-xl text-green-600"><Check size={32} /></div>
                  <h3 className="text-3xl font-black uppercase">Account Created!</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Customer Name', value: createdCustomer.user?.name },
                    { label: 'Email / Login', value: createdCustomer.credentials?.email, field: 'email' },
                    { label: 'Password', value: createdCustomer.credentials?.password, field: 'password' },
                    { label: 'Reference No.', value: createdCustomer.user?.reference_number },
                  ].map(({ label, value, field }) => (
                    <div key={label} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                      <p className="text-xs font-bold uppercase opacity-60 mb-1">{label}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-mono font-bold break-all">{value}</p>
                        {field && (
                          <button onClick={() => copyToClipboard(value, field)} className="hover:text-amber-300 transition flex-shrink-0">
                            {copiedField === field ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => { setCreatedCustomer(null); setFormData({ name:'',email:'',phone:'',pan:'',aadhaar:'',dateOfBirth:'',doorNo:'',buildingName:'',street:'',area:'',city:'',state:'',pincode:'',password:'',status:'active' }); }} className="flex-1 bg-white/20 text-white py-3 rounded-2xl font-bold hover:bg-white/30 transition">
                    + Create Another
                  </button>
                  <button onClick={() => router.push('/admin/customers')} className="flex-1 bg-white text-green-600 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition shadow-xl">
                    Done & Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Guide Panel */}
          {!createdCustomer && (
            <div className="lg:col-span-2">
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white sticky top-24 shadow-2xl">
                <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Admin Guide</h3>
                <div className="space-y-5">
                  {[
                    { num: 1, color: 'blue', text: "Fill in the customer's legal name, email and mobile number for GST compliance." },
                    { num: 2, color: 'amber', text: 'Enter PAN and Aadhaar for identity verification and tax filing.' },
                    { num: 3, color: 'green', text: "Add the customer's complete address for document delivery and compliance." },
                    { num: 4, color: 'purple', text: 'Set a secure password. Share it manually with the user as it is hashed for security.' },
                    { num: 5, color: 'indigo', text: 'System auto-generates a Referral Code and Reference Number for the new user.' },
                  ].map(({ num, color, text }) => (
                    <div key={num} className="flex gap-4">
                      <div className={`w-8 h-8 rounded-full bg-${color}-500/20 flex items-center justify-center flex-shrink-0 text-${color}-400 font-bold border border-${color}-500/30 text-sm`}>{num}</div>
                      <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <div className="flex items-center gap-3 text-amber-400 bg-amber-400/10 p-4 rounded-xl border border-amber-400/20">
                    <Shield size={20} />
                    <p className="text-xs font-medium leading-tight">Data is directly stored in the secure MySQL production database.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
