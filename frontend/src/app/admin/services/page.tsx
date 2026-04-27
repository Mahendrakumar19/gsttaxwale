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
        `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/services`,
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
          `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/admin/services/${editingId}`,
          payload,
          config
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/admin/services`,
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
        `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/admin/services/${id}`,
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-black">Services</h1>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">Management</span>
          </div>
          <Link href="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition flex items-center gap-1">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 bg-white">
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
        )}        {/* Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-black">{isEditing ? 'Edit Service' : 'Create New Service'}</h2>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition cursor-full transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddService} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">Service Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Business GST Filing"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">Description</label>
                  <textarea
                    placeholder="Provide a clear description of what this service includes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      placeholder="5000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">Features (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., Filing, Review, Support"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition shadow-lg shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
                >
                  {isEditing ? 'Save Changes' : 'Publish Service'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service Details</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pricing</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Key Features</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-black">{s.title}</div>
                      <div className="text-sm text-gray-600 mt-0.5 line-clamp-1">{s.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold bg-green-50 text-green-700">
                        ₹{Number(s.price).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(typeof s.features === 'string' ? (() => { try { return JSON.parse(s.features || '[]'); } catch { return [s.features]; } })() : (s.features || []))
                          .slice(0, 2).map((feat: string, idx: number) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {feat}
                            </span>
                          ))
                        }
                        {((typeof s.features === 'string' ? (() => { try { return JSON.parse(s.features || '[]'); } catch { return []; } })() : (s.features || [])).length > 2) && 
                          <span className="text-xs text-gray-400">+{((typeof s.features === 'string' ? (() => { try { return JSON.parse(s.features || '[]'); } catch { return []; } })() : (s.features || [])).length - 2)} more</span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditForm(s)}
                          type="button"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(s.id)}
                          type="button"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Service"
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
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-bold text-gray-900">No services found</h3>
              <p className="text-gray-500">Get started by creating your first service above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
