'use client';
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Save, Shield, Mail, Zap, RefreshCw, CheckCircle, XCircle, CreditCard, Image as ImageIcon, ShieldCheck, Trash2 } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Configuration Core...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Company Profile', icon: <ImageIcon size={14} /> },
    { id: 'hero', label: 'Banner Assets', icon: <Zap size={14} /> },
    { id: 'security', label: 'Security Protocols', icon: <Shield size={14} /> },
    { id: 'payments', label: 'Financial Gateways', icon: <CreditCard size={14} /> },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Global parameters and platform logic governance</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 active:scale-95"
        >
          {saving ? <RefreshCw className="animate-spin w-3.5 h-3.5" /> : <Save size={14} />}
          {saving ? 'Synchronizing...' : 'Commit Changes'}
        </button>
      </div>

      {message.text && (
        <div className={`mb-10 p-5 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-700 ${
          message.type === 'success' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-red-50 border-red-100 text-red-900'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} className="text-slate-900" /> : <XCircle size={20} className="text-red-600" />}
          <p className="font-bold text-[11px] uppercase tracking-widest">{message.text}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-10 bg-slate-50 p-1.5 rounded-2xl w-fit border border-slate-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {activeTab === 'general' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl shadow-sm"><ImageIcon size={20} /></div>
                Organizational Identity
              </h2>
              <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-[0.2em] ml-1">Corporate Branding & Communication</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Legal Entity Name</label>
                <input
                  type="text"
                  value={getVal('BUSINESS_NAME', 'GST Tax Wale')}
                  onChange={(e) => handleChange('BUSINESS_NAME', e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:border-slate-900 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Support Channel Index</label>
                <input
                  type="email"
                  value={getVal('SUPPORT_EMAIL', 'help@gsttaxwale.com')}
                  onChange={(e) => handleChange('SUPPORT_EMAIL', e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:border-slate-900 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Primary Contact Line</label>
                <input
                  type="text"
                  value={getVal('CONTACT_PHONE', '+91 9666965432')}
                  onChange={(e) => handleChange('CONTACT_PHONE', e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:border-slate-900 outline-none transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Physical Asset Headquarters</label>
                <textarea
                  value={getVal('OFFICE_ADDRESS', 'Madhapur, Hyderabad, TS')}
                  onChange={(e) => handleChange('OFFICE_ADDRESS', e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:border-slate-900 outline-none transition-all resize-none h-28"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hero' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center justify-between mb-10">
               <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl shadow-sm"><Zap size={20} /></div>
                    Marketing Assets
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-[0.2em] ml-1">Institutional Banner Management</p>
               </div>
               <div className="relative">
                 <input 
                   type="file" 
                   accept="image/*" 
                   onChange={handleSliderUpload} 
                   className="absolute inset-0 opacity-0 cursor-pointer"
                   disabled={uploading}
                 />
                 <button className={`px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 ${uploading ? 'opacity-50' : 'hover:bg-slate-800'}`}>
                   {uploading ? 'Synchronizing File...' : 'Initialize Asset Upload'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {sliders.map((slider) => (
                 <div key={slider.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-[16/9] shadow-sm hover:shadow-xl transition-all duration-500">
                    <img src={slider.imageUrl} alt="Banner" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 backdrop-blur-[2px]">
                       <div className="flex items-center justify-between gap-3">
                          <button 
                            onClick={() => handleToggleSlider(slider.id, !slider.isActive)}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all ${slider.isActive ? 'bg-white text-slate-900 shadow-xl' : 'bg-slate-700/50 text-white border border-white/20'}`}
                          >
                             {slider.isActive ? 'Active Node' : 'Draft Protocol'}
                          </button>
                          <button 
                            onClick={() => handleDeleteSlider(slider.id)}
                            className="p-2.5 bg-red-600/90 text-white rounded-xl hover:bg-red-600 transition shadow-lg"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                    {!slider.isActive && (
                      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-[9px] font-bold uppercase tracking-[0.3em] border border-white/30 shadow-2xl">Asset Offline</span>
                      </div>
                    )}
                 </div>
               ))}
               {sliders.length === 0 && !sliderLoading && (
                 <div className="col-span-full py-24 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Zero Institutional Banners Registered</p>
                 </div>
               )}
             </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10">
               <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                 <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl shadow-sm"><Shield size={20} /></div>
                 Operational Security
               </h2>
               <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-[0.2em] ml-1">Platform Integrity Protocols</p>
            </div>
            
            <div className="space-y-6">
              {[
                { key: 'ENABLE_OTP', label: 'Identity Verification Matrix (OTP)', desc: 'Multifactor authentication protocol for critical user lifecycle events' },
                { key: 'ADMIN_NOTIFICATIONS', label: 'Strategic Administrative Alerts', desc: 'Critical system event broadcasting to high-level administrative nodes' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all">
                  <div>
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[11px] mb-1">{item.label}</h3>
                    <p className="text-[10px] text-slate-500 font-medium tracking-tight leading-relaxed max-w-md">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.key, getVal(item.key, true))}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all shadow-inner ${
                      getVal(item.key, true) ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all shadow-md ${
                      getVal(item.key, true) ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10">
               <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                 <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl shadow-sm"><CreditCard size={20} /></div>
                 Financial Settlement Infrastructure
               </h2>
               <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-[0.2em] ml-1">Transaction Node Configuration</p>
            </div>

            <div className="space-y-10">
              <div className="p-8 bg-slate-900 rounded-2xl border border-slate-900 flex items-start gap-6 shadow-2xl">
                <div className="mt-1 p-3 bg-white/10 rounded-xl"><ShieldCheck className="text-white" size={24} /></div>
                <div>
                  <h4 className="font-bold text-white uppercase tracking-[0.2em] text-[11px] mb-2">Razorpay Institutional Instance</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-xl">
                    Ensure production credentials are never committed to environmental registries. 
                    Cryptographic keys managed within this interface are persisted in a secure, isolated state.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Instance Key Identifier</label>
                  <input
                    type="text"
                    value={getVal('RAZORPAY_KEY_ID', '')}
                    onChange={(e) => handleChange('RAZORPAY_KEY_ID', e.target.value)}
                    placeholder="rzp_live_protocol_..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:border-slate-900 outline-none transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Secure Protocol Secret</label>
                  <input
                    type="password"
                    value={getVal('RAZORPAY_KEY_SECRET', '')}
                    onChange={(e) => handleChange('RAZORPAY_KEY_SECRET', e.target.value)}
                    placeholder="••••••••••••••••••••••••••••"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:border-slate-900 outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-20 text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">System Core Protocol • v4.0.0-STABLE • Verified</p>
      </div>
    </div>
  );
}
