'use client';
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Save, Shield, Mail, Zap, RefreshCw, CheckCircle, XCircle, CreditCard, Image as ImageIcon, ShieldCheck } from 'lucide-react';

interface SystemSetting {
  id: number;
  key: string;
  value: any;
  type: string;
  updatedAt: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Categorized UI sections
  const [activeTab, setActiveTab] = useState('general');
  const [sliders, setSliders] = useState<any[]>([]);
  const [sliderLoading, setSliderLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchSliders();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/config');
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setMessage({ type: 'error', text: 'Failed to load system settings' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSliders = async () => {
    setSliderLoading(true);
    try {
      const res = await api.get('/api/sliders');
      setSliders(res.data.data?.sliders || []);
    } catch (err) {
      console.error('Failed to fetch sliders:', err);
    } finally {
      setSliderLoading(false);
    }
  };

  const handleSliderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      await api.post('/api/admin/sliders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'New banner uploaded successfully' });
      fetchSliders();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload banner' });
    } finally {
      setUploading(false);
    }
  };

  const handleToggleSlider = async (id: number, active: boolean) => {
    try {
      await api.put(`/api/admin/sliders/${id}/toggle`, { active });
      setSliders(prev => prev.map(s => s.id === id ? { ...s, isActive: active } : s));
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update slider status' });
    }
  };

  const handleDeleteSlider = async (id: number) => {
    if (!confirm('Permanently remove this banner image?')) return;
    try {
      await api.delete(`/api/admin/sliders/${id}`);
      setSliders(prev => prev.filter(s => s.id !== id));
      setMessage({ type: 'success', text: 'Banner purged' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete banner' });
    }
  };

  const handleToggle = (key: string, currentValue: boolean) => {
    setSettings(prev => {
      const existing = prev.find(s => s.key === key);
      if (existing) {
        return prev.map(s => s.key === key ? { ...s, value: !currentValue } : s);
      } else {
        return [...prev, { id: 0, key, value: !currentValue, type: 'boolean', updatedAt: '' }];
      }
    });
  };

  const handleChange = (key: string, value: string, type: string = 'text') => {
    setSettings(prev => {
      const existing = prev.find(s => s.key === key);
      if (existing) {
        return prev.map(s => s.key === key ? { ...s, value } : s);
      } else {
        return [...prev, { id: 0, key, value, type, updatedAt: '' }];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await api.post('/api/admin/config', { settings });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Configuration synchronized across all systems!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMessage({ type: 'error', text: 'Critical: Failed to persist settings' });
    } finally {
      setSaving(false);
    }
  };

  const getVal = (key: string, defaultValue: any) => {
    const s = settings.find(i => i.key === key);
    return s ? s.value : defaultValue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-6">
          <RefreshCw className="animate-spin text-blue-600 w-12 h-12" />
          <p className="text-slate-400 font-black tracking-widest text-xs uppercase">Initializing System Core...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Branding', icon: <ImageIcon size={18} /> },
    { id: 'hero', label: 'Hero', icon: <Zap size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="px-6 py-10 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-widest">Master Control</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Site Administration</h1>
          <p className="text-slate-500 font-medium mt-1">Configure global parameters and business logic</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black transition-all shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'SYNCING...' : 'COMMIT ALL CHANGES'}
        </button>
      </div>

      {message.text && (
        <div className={`mb-10 p-6 rounded-[2rem] border-2 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 ${
          message.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          <div className={`p-3 rounded-2xl ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {message.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
          </div>
          <p className="font-black uppercase tracking-tight text-sm">{message.text}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-10 bg-slate-100 p-2 rounded-[2rem] w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {activeTab === 'general' && (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><ImageIcon size={20} /></div>
              Business Branding
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Name</label>
                <input
                  type="text"
                  value={getVal('BUSINESS_NAME', 'GST Tax Wale')}
                  onChange={(e) => handleChange('BUSINESS_NAME', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                <input
                  type="email"
                  value={getVal('SUPPORT_EMAIL', 'help@gsttaxwale.com')}
                  onChange={(e) => handleChange('SUPPORT_EMAIL', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                <input
                  type="text"
                  value={getVal('CONTACT_PHONE', '+91 9666965432')}
                  onChange={(e) => handleChange('CONTACT_PHONE', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Head Office Address</label>
                <textarea
                  value={getVal('OFFICE_ADDRESS', 'Madhapur, Hyderabad, TS')}
                  onChange={(e) => handleChange('OFFICE_ADDRESS', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hero' && (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                 <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Zap size={20} /></div>
                 Homepage Hero Banners
               </h2>
               <div className="relative">
                 <input 
                   type="file" 
                   accept="image/*" 
                   onChange={handleSliderUpload} 
                   className="absolute inset-0 opacity-0 cursor-pointer"
                   disabled={uploading}
                 />
                 <button className={`px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all ${uploading ? 'opacity-50 animate-pulse' : 'hover:bg-blue-700'}`}>
                   {uploading ? 'UPLOADING...' : 'ADD NEW BANNER'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {sliders.map((slider) => (
                 <div key={slider.id} className="relative group rounded-[2rem] overflow-hidden border border-slate-200 aspect-[16/9]">
                    <img src={slider.imageUrl} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                       <div className="flex items-center justify-between gap-3">
                          <button 
                            onClick={() => handleToggleSlider(slider.id, !slider.isActive)}
                            className={`flex-1 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${slider.isActive ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                          >
                             {slider.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                          <button 
                            onClick={() => handleDeleteSlider(slider.id)}
                            className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                    {!slider.isActive && <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center"><span className="px-3 py-1 bg-white/20 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Disabled</span></div>}
                 </div>
               ))}
               {sliders.length === 0 && !sliderLoading && (
                 <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No banners configured</p>
                 </div>
               )}
             </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Shield size={20} /></div>
              Access & Security
            </h2>
            <div className="space-y-6">
              {[
                { key: 'ENABLE_OTP', label: 'OTP Verification', desc: 'Require email OTP for login and registration' },
                { key: 'ADMIN_NOTIFICATIONS', label: 'Admin Alerts', desc: 'Receive email notifications for new orders' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">{item.label}</h3>
                    <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.key, getVal(item.key, true))}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${
                      getVal(item.key, true) ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all shadow-md ${
                      getVal(item.key, true) ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><CreditCard size={20} /></div>
              Payment Gateway
            </h2>
            <div className="space-y-8">
              <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100 flex items-start gap-4">
                <div className="mt-1"><ShieldCheck className="text-indigo-600" size={24} /></div>
                <div>
                  <h4 className="font-black text-indigo-900 uppercase tracking-tight text-sm mb-1">Razorpay Integration</h4>
                  <p className="text-xs text-indigo-600/70 font-medium">Use test keys for development and live keys for production.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razorpay Key ID</label>
                  <input
                    type="text"
                    value={getVal('RAZORPAY_KEY_ID', '')}
                    onChange={(e) => handleChange('RAZORPAY_KEY_ID', e.target.value)}
                    placeholder="rzp_test_..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razorpay Secret</label>
                  <input
                    type="password"
                    value={getVal('RAZORPAY_KEY_SECRET', '')}
                    onChange={(e) => handleChange('RAZORPAY_KEY_SECRET', e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Synchronized with Backend Engine v2.0</p>
      </div>
    </div>
  );
}

function Trash2({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  );
}

      <div className="mt-16 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Synchronized with Backend Engine v2.0</p>
      </div>
    </div>
  );
}

