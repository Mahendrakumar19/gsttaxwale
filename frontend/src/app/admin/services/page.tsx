"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { Edit2, Trash2, X } from 'lucide-react';

export default function AdminServices() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    features: '',
  });

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();
    if (!token || user?.role !== 'admin') {
      router.push('/admin');
      return;
    }
    loadServices();
    const interval = setInterval(loadServices, 3000);
    return () => clearInterval(interval);
  }, [router]);

  async function loadServices() {
    try {
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/services`,
        config
      );
      setServices(res.data.data?.services || []);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({ title: '', description: '', price: 0, features: '' });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  const openEditForm = (service: any) => {
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price,
      features: Array.isArray(service.features) ? service.features.join(', ') : 
                (typeof service.features === 'string' ? service.features : ''),
    });
    setEditingId(service.id);
    setIsEditing(true);
    setShowForm(true);
  };

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    try {
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
      };

      if (isEditing && editingId) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/services/${editingId}`,
          payload,
          config
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/services`,
          payload,
          config
        );
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
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/services/${id}`,
        config
      );
      loadServices();
    } catch (err) {
      alert('Failed to delete service');
    }
  }

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 shadow-sm bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Admin Services</h1>
          <Link href="/admin/dashboard" className="text-gray-600 hover:text-blue-600 transition">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add/Edit Service Button */}
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setIsEditing(false);
              resetForm();
            }}
            className="mb-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-green-600/50 cursor-pointer"
          >
            + Add New Service
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Service' : 'Add New Service'}</h2>
              <button
                onClick={resetForm}
                className="text-gray-600 hover:text-gray-900 transition cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddService} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Title</label>
                <input
                  type="text"
                  placeholder="e.g., Business GST Filing"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Description</label>
                <textarea
                  placeholder="Service description and details"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">Features (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., Filing, Review, Support"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-green-600/50 cursor-pointer"
                >
                  {isEditing ? 'Update Service' : 'Add Service'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services Table */}
        <div className="glassmorphic-dark rounded-xl border border-slate-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600/30">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Service</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Price</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-200">Features</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-b border-slate-600/20 hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">{s.title}</div>
                      <div className="text-sm text-slate-400 mt-1">{s.description?.substring(0, 50)}…</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-400">₹{Number(s.price).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {typeof s.features === 'string' ? (() => { try { return JSON.parse(s.features || '[]').join(', '); } catch { return s.features; } })() : (s.features || []).join(', ')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditForm(s)}
                          type="button"
                          className="p-2 hover:bg-slate-700 rounded transition text-amber-400 hover:text-amber-300 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(s.id)}
                          type="button"
                          className="p-2 hover:bg-slate-700 rounded transition text-red-400 hover:text-red-300 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {services.length === 0 && (
            <div className="text-center py-12 text-slate-400">📦 No services yet. Add one above to get started!</div>
          )}
        </div>
      </div>
    </div>
  );
}
