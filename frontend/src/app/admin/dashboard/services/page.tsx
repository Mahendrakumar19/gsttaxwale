"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { Wrench, Plus, Trash2, Edit, ArrowLeft } from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: 0 });

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    if (!token) {
      router.push('/admin');
      return;
    }

    loadServices(token);
  }, [router]);

  async function loadServices(token: string) {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/services`,
        config
      );
      setServices(res.data.data?.services || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    try {
      const token = adminAuth.getAdminToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/services`,
        formData,
        config
      );

      setServices([...services, res.data.data]);
      setFormData({ name: '', description: '', price: 0 });
      setShowForm(false);
    } catch (err: any) {
      alert('Failed to add service');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="hover:text-purple-400 transition">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <Wrench size={32} className="text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold">Services</h1>
              <p className="text-slate-400">Manage services</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
        >
          <Plus size={20} />
          Add Service
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAddService} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Service Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-purple-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Price (₹)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {services.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No services found
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                  <p className="text-slate-400 text-sm mt-2">{service.description}</p>
                  <p className="text-2xl font-bold text-purple-400 mt-4">₹{service.price?.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-700 rounded transition text-slate-400 hover:text-blue-400">
                    <Edit size={20} />
                  </button>
                  <button className="p-2 hover:bg-slate-700 rounded transition text-slate-400 hover:text-red-400">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
