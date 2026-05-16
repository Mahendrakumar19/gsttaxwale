'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';
import { ArrowLeft, User, Mail, Phone, Copy, Check, Shield, Zap, Target, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function CreateUserPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pan: '',
    dateOfBirth: '',
    referral_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = adminAuth.getAdminToken();
      const user = adminAuth.getAdminUser();

      if (!token || user?.role !== 'admin') {
        router.push('/auth/login');
        return;
      }

      setAdminUser(user);
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
      if (!formData.name || !formData.email || !formData.phone || !formData.pan) {
        setError('Missing required identity parameters: Name, Email, Phone, and PAN are mandatory');
        setLoading(false);
        return;
      }

      const response = await api.post('/api/admin/users', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        pan: formData.pan,
        dateOfBirth: formData.dateOfBirth,
        referral_code: formData.referral_code || undefined,
      });

      if (response.data.success && response.data.data.user) {
        setCreatedUser(response.data.data);
        setSuccess('Identity record successfully synchronized with universal directory');
        setFormData({
          name: '',
          email: '',
          phone: '',
          pan: '',
          dateOfBirth: '',
          referral_code: '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Protocol failure: Failed to register identity node');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!adminUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verifying Administrative Credentials...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
           <Link href="/admin/users" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 mb-4 transition-all">
             <ArrowLeft size={14} />
             Return to Identity Directory
           </Link>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Registration</h1>
           <p className="text-sm text-slate-500 mt-1 font-medium">Provisioning new identity nodes within the institutional registry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form Section */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-10">
               <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg">
                  <User size={18} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Identity Profile</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Core registration parameters</p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-5 rounded-2xl border border-red-100 bg-red-50 flex items-center gap-4 animate-in slide-in-from-top-4">
                  <AlertCircle size={20} className="text-red-600" />
                  <p className="font-bold text-[10px] uppercase tracking-widest text-red-900">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Legal Entity Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full legal name index..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Communication Index (Email) *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="entity@institutional.com"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Mobile Terminal *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Identity Hash (PAN) *</label>
                  <input
                    type="text"
                    name="pan"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300 font-mono tracking-widest"
                    required
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Temporal Origin (DOB)</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Affiliate Reference</label>
                  <input
                    type="text"
                    name="referral_code"
                    value={formData.referral_code}
                    onChange={handleChange}
                    placeholder="Optional referral key..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.99]"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                  {loading ? 'Executing Protocol...' : 'Synchronize Identity Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Success / Summary Section */}
        <div className="lg:col-span-5">
           {createdUser ? (
             <div className="bg-slate-900 rounded-[2rem] p-10 shadow-2xl text-white animate-in slide-in-from-right-8 duration-700 relative overflow-hidden group">
               <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000" />
               
               <div className="flex items-center gap-4 mb-10 relative">
                 <div className="p-3 bg-white text-slate-900 rounded-2xl shadow-xl">
                    <Check size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold tracking-tight">Node Provisioned</h2>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Identity record verified & secured</p>
                 </div>
               </div>

               <div className="space-y-6 relative">
                 {[
                   { label: 'Entity Name', value: createdUser.user.name, copy: false },
                   { label: 'Comm. Terminal', value: createdUser.user.email, copy: true, id: 'email' },
                   { label: 'Mobile Index', value: createdUser.user.phone, copy: true, id: 'phone' },
                   { label: 'Identity Hash (PAN)', value: createdUser.user.pan, copy: true, id: 'pan' },
                   { label: 'Temporary Cipher', value: createdUser.credentials.tempPassword, copy: true, id: 'password', secret: true },
                   { label: 'Affiliate Code', value: createdUser.user.referral_code, copy: true, id: 'referral' },
                 ].map((item, idx) => (
                   <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-all">
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">{item.label}</p>
                      <div className="flex items-center justify-between gap-4">
                         <p className={`font-mono font-bold tracking-tight break-all ${item.secret ? 'text-blue-400' : 'text-white'}`}>
                            {item.value}
                         </p>
                         {item.copy && (
                           <button
                             onClick={() => copyToClipboard(item.value, item.id || '')}
                             className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-500 hover:text-white"
                           >
                             {copiedField === item.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                           </button>
                         )}
                      </div>
                   </div>
                 ))}

                 <div className="pt-8 border-t border-white/10 mt-10">
                    <div className="flex items-start gap-3 mb-8">
                       <Shield size={16} className="text-slate-500 shrink-0 mt-1" />
                       <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                         Credential metadata has been broadcast to the primary terminal. Mandatory password rotation protocol will be enforced on initial access attempt.
                       </p>
                    </div>
                    <button
                      onClick={() => router.push('/admin/users')}
                      className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-[10px] uppercase tracking-[0.4em] transition-all hover:bg-slate-100 shadow-xl active:scale-[0.98]"
                    >
                      Return to Universal Registry
                    </button>
                 </div>
               </div>
             </div>
           ) : (
             <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center flex flex-col items-center justify-center min-h-[500px] shadow-inner group">
                <div className="w-20 h-20 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-10 shadow-sm group-hover:scale-110 transition-transform duration-700">
                   <Target size={32} className="text-slate-200" />
                </div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-4">Awaiting Registration Data</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[280px]">
                  Populate the identity profile to initialize the institutional synchronization protocol.
                </p>
             </div>
           )}
        </div>
      </div>

      <div className="mt-20 text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">Identity Provisioning Protocol • v4.20-STABLE • SECURE</p>
      </div>
    </div>
  );
}
