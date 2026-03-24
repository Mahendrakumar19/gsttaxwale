"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { adminAuth } from '../../../lib/adminAuth';

export default function AdminServices() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/services`,
        payload,
        config
      );
      setFormData({ title: '', description: '', price: 0, features: '' });
      setShowForm(false);
      loadServices();
    } catch (err: any) {
      alert('Failed to add service: ' + (err.response?.data?.message || err.message));
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-slate-300 text-lg">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation */}
      <nav className="glassmorphic sticky top-0 z-50 border-b border-slate-600/30 shadow-lg">
      </nav>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Service Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-green-600/50"
        >
          {showForm ? '✕ Cancel' : '+ Add New Service'}
        </button>

        {/* Form */}
        {showForm && (
          <div className="glassmorphic-dark p-8 rounded-xl border border-slate-500/20 mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Add New Service</h2>
            <form onSubmit={handleAddService} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Service Title</label>
                <input
                  type="text"
                  placeholder="e.g., Business GST Filing"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
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
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-green-600/50"
              >
                Add Service
              </button>
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
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-200">Action</th>
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
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                      >
                        Delete
                      </button>
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
