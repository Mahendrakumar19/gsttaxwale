'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Save, X, Loader2, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Location {
  id: number;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  email: string | null;
  phone: string | null;
  mapUrl: string | null;
  active: boolean | number;
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    email: '',
    phone: '',
    mapUrl: '',
    active: true
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/api/admin/locations');
      if (response.data.success) {
        setLocations(response.data.data.locations);
      }
    } catch (error) {
      toast.error('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      email: '',
      phone: '',
      mapUrl: '',
      active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (location: Location) => {
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city || '',
      state: location.state || '',
      pincode: location.pincode || '',
      email: location.email || '',
      phone: location.phone || '',
      mapUrl: location.mapUrl || '',
      active: !!location.active
    });
    setEditingId(location.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/api/admin/locations/${editingId}`, formData);
        toast.success('Location updated');
      } else {
        await api.post('/api/admin/locations', formData);
        toast.success('Location added');
      }
      resetForm();
      fetchLocations();
    } catch (error) {
      toast.error('Failed to save location');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      await api.delete(`/api/admin/locations/${id}`);
      toast.success('Location deleted');
      fetchLocations();
    } catch (error) {
      toast.error('Failed to delete location');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Physical Network...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Infrastructure Directory</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Monitoring institutional physical assets, branch offices, and communication nodes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Discard Composition' : 'Initialize Node'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="mb-8">
             <h2 className="text-xl font-bold text-slate-900 tracking-tight">{editingId ? 'Modify Node Configuration' : 'Initialize New Asset'}</h2>
             <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-[0.2em]">Operational Asset Registration</p>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Asset Identity *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Institutional Branch Name"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Geographic Address *</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Complete structural address..."
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-slate-900 transition-all h-28 resize-none placeholder:text-slate-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Urban Hub</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Jurisdiction</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Postal Index</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Communication Index (Email)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Telecommunication Line</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Navigational Hash (Maps)</label>
              <input
                type="url"
                value={formData.mapUrl}
                onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                placeholder="Institutional Maps Protocol URL"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="flex items-center gap-3 ml-1">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-slate-900 rounded-lg border-slate-300 focus:ring-slate-900/20"
              />
              <label htmlFor="active" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors">Published on public matrix</label>
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 active:scale-95"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Commit Changes' : 'Initialize Asset Node'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {locations.map((location) => (
          <div key={location.id} className={`group bg-white rounded-3xl shadow-sm border ${location.active ? 'border-slate-200 hover:border-slate-900' : 'border-red-100 bg-red-50/10'} overflow-hidden transition-all duration-500 hover:shadow-xl`}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className={`p-3 rounded-2xl ${location.active ? 'bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white' : 'bg-red-50 text-red-600'} transition-all shadow-sm`}>
                  <MapPin size={20} />
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(location)}
                    className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                    title="Modify Configuration"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Terminate Node"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-lg mb-2 tracking-tight">{location.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2 h-10 font-medium">{location.address}</p>
              
              <div className="space-y-3 mb-10">
                {location.email && (
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                    <span className="text-slate-200">📧</span>
                    <span className="truncate">{location.email}</span>
                  </div>
                )}
                {location.phone && (
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                    <span className="text-slate-200">📞</span>
                    <span>{location.phone}</span>
                  </div>
                )}
              </div>

              {!location.active && (
                <div className="mb-8 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-red-600 bg-red-50 px-3 py-1.5 rounded-lg w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                  Asset Inactive
                </div>
              )}

              {location.mapUrl && (
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <ExternalLink size={14} />
                  Satellite Link
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">Infrastructure Governance • Protocol v4.0-STABLE</p>
      </div>
    </div>
  );
}
