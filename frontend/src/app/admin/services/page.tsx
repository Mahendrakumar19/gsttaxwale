"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';
import { Edit2, Trash2, X, Zap, Save } from 'lucide-react';

export default function AdminServices() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Inline edit state
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineData, setInlineData] = useState({ price: '', requirements: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountedPrice: '',
    features: '',
    requirements: '',
    turnaroundDays: '',
    category: 'GST'
  });

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();
    if (!token || user?.role !== 'admin') {
      router.push('/admin');
      return;
    }
    loadServices();
  }, [router]);

  async function loadServices() {
    try {
      const res = await api.get('/api/services');
      setServices(res.data.data?.services || []);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({ 
      title: '', description: '', price: '', discountedPrice: '', 
      features: '', requirements: '', turnaroundDays: '', category: 'GST' 
    });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  const openEditForm = (service: any) => {
    setFormData({
      title: service.title || service.name || '',
      description: service.description || '',
      price: String(service.price || ''),
      discountedPrice: String(service.discountedPrice || ''),
      features: Array.isArray(service.features) ? service.features.join(', ') : 
                (typeof service.features === 'string' ? service.features : ''),
      requirements: service.requirements || '',
      turnaroundDays: String(service.turnaroundDays || ''),
      category: service.category || 'GST'
    });
    setEditingId(service.id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startInlineEdit = (service: any) => {
    setInlineEditingId(service.id);
    setInlineData({
      price: String(service.price || ''),
      requirements: service.requirements || ''
    });
  };

  const cancelInlineEdit = () => {
    setInlineEditingId(null);
    setInlineData({ price: '', requirements: '' });
  };

  async function handleInlineSave(id: string) {
    try {
      await api.put(`/api/admin/services/${id}`, {
        price: Number(inlineData.price),
        requirements: inlineData.requirements
      });
      setInlineEditingId(null);
      loadServices();
    } catch (err: any) {
      alert('Failed to update: ' + (err.response?.data?.message || err.message));
    }
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        discountedPrice: Number(formData.discountedPrice) || 0,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        requirements: formData.requirements,
        turnaroundDays: Number(formData.turnaroundDays) || 0,
        category: formData.category
      };

      if (isEditing && editingId) {
        await api.put(`/api/admin/services/${editingId}`, payload);
      } else {
        await api.post('/api/admin/services', payload);
      }
      
      resetForm();
      loadServices();
    } catch (err: any) {
      alert('Failed to save service: ' + (err.response?.data?.message || err.message));
    }
  }

  async function handleDeleteService(id: string) {
    if (!confirm('Delete this service?')) return;
    try {
      await api.delete(`/api/admin/services/${id}`);
      loadServices();
    } catch (err) {
      alert('Failed to delete service');
    }
  }

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-500 text-lg font-medium tracking-tight">Loading services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-widest">Service Catalog</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Product & Services</h1>
          <p className="text-slate-500 font-medium mt-1">Configure tax services, pricing structures, and filing requirements</p>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setIsEditing(false);
              resetForm();
            }}
            className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs"
          >
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">+</div>
            Create New Service
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{isEditing ? 'Edit Service' : 'New Service'}</h2>
              <p className="text-slate-500 font-medium">Configure service details, pricing, and requirements</p>
            </div>
            <button onClick={resetForm} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition cursor-pointer">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleAddService} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                >
                  <option value="GST">GST Services</option>
                  <option value="ITR">Income Tax (ITR)</option>
                  <option value="BUSINESS">Business Setup</option>
                  <option value="AUDIT">Audit & Compliance</option>
                </select>
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Offer Price (₹)</label>
                <input
                  type="number"
                  value={formData.discountedPrice}
                  onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition text-green-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Turnaround Days</label>
                <input
                  type="number"
                  value={formData.turnaroundDays}
                  onChange={(e) => setFormData({ ...formData, turnaroundDays: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Documents Required</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="e.g., PAN Card, Aadhaar, Bank Statement..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-8 border-t border-slate-100">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs">
                {isEditing ? 'COMMIT SERVICE CHANGES' : 'PUBLISH NEW SERVICE'}
              </button>
              <button type="button" onClick={resetForm} className="px-8 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black transition uppercase tracking-widest text-xs">
                Abort
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Info</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Structure</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Docs</th>
                <th className="text-center px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-8 py-6 max-w-md">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg">{s.category || 'GST'}</span>
                      <h4 className="font-black text-slate-900 tracking-tight truncate">{s.title || s.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 font-medium leading-relaxed">{s.description}</p>
                  </td>
                  <td className="px-8 py-6">
                    {inlineEditingId === s.id ? (
                      <div className="space-y-2 animate-in fade-in duration-300">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price (₹)</label>
                        <input
                          type="number"
                          value={inlineData.price}
                          onChange={(e) => setInlineData({ ...inlineData, price: e.target.value })}
                          className="w-full px-4 py-2 bg-white border-2 border-blue-200 rounded-xl text-sm font-black focus:border-blue-500 outline-none transition-all shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-900 tracking-tighter">₹{Number(s.price).toLocaleString()}</span>
                        {s.discountedPrice > 0 && <span className="text-[10px] text-green-600 font-black uppercase tracking-widest mt-0.5">Sale: ₹{Number(s.discountedPrice).toLocaleString()}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {inlineEditingId === s.id ? (
                      <div className="space-y-2 animate-in fade-in duration-300">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Required Docs</label>
                        <textarea
                          value={inlineData.requirements}
                          onChange={(e) => setInlineData({ ...inlineData, requirements: e.target.value })}
                          className="w-full min-w-[250px] px-4 py-2 bg-white border-2 border-blue-200 rounded-xl text-xs font-bold focus:border-blue-500 outline-none transition-all shadow-sm"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <div className="max-w-xs">
                        <p className="text-xs text-slate-500 font-bold line-clamp-2 leading-relaxed">{s.requirements || 'No requirements specified'}</p>
                        <div className="flex items-center gap-1 mt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <Zap size={10} className="text-blue-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Inline Editable</span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3">
                      {inlineEditingId === s.id ? (
                        <>
                          <button onClick={() => handleInlineSave(s.id)} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition active:scale-95">
                            <Save size={18} />
                          </button>
                          <button onClick={cancelInlineEdit} className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition active:scale-95">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startInlineEdit(s)} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition shadow-sm border border-slate-100 group-hover:scale-110 active:scale-95" title="Quick Edit">
                            <Zap size={18} />
                          </button>
                          <button onClick={() => openEditForm(s)} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition shadow-sm border border-slate-100 group-hover:scale-110 active:scale-95">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteService(s.id)} className="p-2.5 bg-slate-50 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition shadow-sm border border-slate-100 group-hover:scale-110 active:scale-95">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {services.length === 0 && (
          <div className="text-center py-24 bg-slate-50/50">
            <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">📦</div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Catalog Empty</h3>
            <p className="text-slate-500 font-medium">Create your first service to start selling</p>
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Live Catalog Engine • v2.1.0</p>
      </div>
    </div>
  );
}
