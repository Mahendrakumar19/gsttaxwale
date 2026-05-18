'use client';

import { useEffect, useState } from 'react';
import { User, Phone, Mail, Lock, Pencil, X } from 'lucide-react';
import api from '@/lib/api';

interface UserSummaryCardProps {
  onRefresh?: () => void;
}

export default function UserSummaryCard({ onRefresh }: UserSummaryCardProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/user/profile');
      setUser(response.data.data);
      setFormData(response.data.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/api/dashboard/user/profile', formData);
      setUser(response.data.data);
      setIsEditing(false);
      setError('');
      onRefresh?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-white rounded-lg shadow border border-red-200 bg-red-50">
        <p className="text-red-600">{error || 'Unable to load profile'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Pencil size={16} />
            Edit
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold">Full Name</p>
              <p className="text-gray-900 font-medium">{user.name || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold">Email</p>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold">Mobile Number</p>
              <p className="text-gray-900 font-medium">{user.phone || '7870778771'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold">PAN (Permanent Account Number)</p>
              <p className="text-gray-900 font-medium">{user.pan || 'Not provided'}</p>
            </div>
          </div>

          <div className="col-span-full flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Filing Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
              </span>
            </div>
            <button 
              onClick={() => alert('Filing removal requested. Our team will contact you shortly.')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 underline transition"
            >
              Remove Filing
            </button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData(user);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              <X size={20} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
