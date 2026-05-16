"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';
import { Edit2, Trash2, X, Zap, Save, Plus, Shield } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Service Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portfolio Management</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Configuring institutional tax offerings, fiscal models, and compliance requirements</p>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setIsEditing(false);
              resetForm();
            }}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 uppercase tracking-widest text-[10px]"
          >
            <Plus size={14} />
            Initialize Service
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{isEditing ? 'Modify Service Node' : 'Initialize New Offering'}</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">Defining structural attributes and capital requirements</p>
            </div>
            <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleAddService} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Asset Identity</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                  placeholder="Service Descriptor"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Classification</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-slate-900 transition-all cursor-pointer appearance-none"
                >
                  <option value="GST">GST Compliance</option>
                  <option value="ITR">Income Asset Management</option>
                  <option value="BUSINESS">Entity Structuring</option>
                  <option value="AUDIT">Institutional Audit</option>
                </select>
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Service Scope</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-slate-900 transition-all resize-none"
                  rows={4}
                  placeholder="Define the scope of operational engagement..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Nominal Valuation (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Settlement Quote (₹)</label>
                <input
                  type="number"
                  value={formData.discountedPrice}
                  onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Latency (Days)</label>
                <input
                  type="number"
                  value={formData.turnaroundDays}
                  onChange={(e) => setFormData({ ...formData, turnaroundDays: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all"
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Documentation Protocol</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List essential evidentiary requirements..."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-slate-900 transition-all resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-8 border-t border-slate-100">
              <button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
                {isEditing ? 'Commit Changes' : 'Initialize Portfolio Node'}
              </button>
              <button type="button" onClick={resetForm} className="px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">
                Discard
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portfolio Item</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capital Model</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requirements Matrix</th>
                <th className="text-right px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5 max-w-md">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded-lg uppercase tracking-[0.15em]">{s.category || 'GST'}</span>
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight truncate">{s.title || s.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{s.description}</p>
                  </td>
                  <td className="px-6 py-5">
                    {inlineEditingId === s.id ? (
                      <div className="animate-in fade-in duration-300">
                        <input
                          type="number"
                          value={inlineData.price}
                          onChange={(e) => setInlineData({ ...inlineData, price: e.target.value })}
                          className="w-28 px-4 py-2 bg-white border border-slate-900 rounded-xl text-xs font-bold outline-none shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 tracking-tight">₹{Number(s.price).toLocaleString()}</span>
                        {s.discountedPrice > 0 && <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Settlement: ₹{Number(s.discountedPrice).toLocaleString()}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {inlineEditingId === s.id ? (
                      <div className="animate-in fade-in duration-300">
                        <textarea
                          value={inlineData.requirements}
                          onChange={(e) => setInlineData({ ...inlineData, requirements: e.target.value })}
                          className="w-full min-w-[240px] px-4 py-2 bg-white border border-slate-900 rounded-xl text-xs font-medium outline-none shadow-sm"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <div className="max-w-xs">
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{s.requirements || 'Protocol Undefined'}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {inlineEditingId === s.id ? (
                        <>
                          <button onClick={() => handleInlineSave(s.id)} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition active:scale-90">
                            <Save size={14} />
                          </button>
                          <button onClick={cancelInlineEdit} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 transition active:scale-90">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startInlineEdit(s)} className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all" title="Rapid Modification">
                            <Zap size={14} />
                          </button>
                          <button onClick={() => openEditForm(s)} className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all" title="Full Configuration">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteService(s.id)} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Decommission Node">
                            <Trash2 size={14} />
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
          <div className="text-center py-28 bg-slate-50/50">
            <div className="w-16 h-16 bg-white border border-slate-100 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">📦</div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portfolio Stream Terminated</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">No operational offerings currently registered</p>
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">Portfolio Governance Protocol • v2.1-SECURE</p>
      </div>
    </div>
  );
}
