'use client';
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Save, Shield, Mail, Zap, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

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

  useEffect(() => {
    fetchSettings();
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

  const handleToggle = (key: string, currentValue: boolean) => {
    setSettings(prev => {
      const exists = prev.some(s => s.key === key);
      if (exists) {
        return prev.map(s => s.key === key ? { ...s, value: !currentValue } : s);
      } else {
        let type = 'boolean';
        return [...prev, {
          id: Date.now(),
          key,
          value: !currentValue,
          type,
          updatedAt: new Date().toISOString()
        }];
      }
    });
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => {
      const exists = prev.some(s => s.key === key);
      if (exists) {
        return prev.map(s => s.key === key ? { ...s, value } : s);
      } else {
        let type = 'text';
        if (key === 'ENABLE_OTP' || key === 'ENABLE_REFERRAL' || key === 'MAINTENANCE_MODE') type = 'boolean';
        return [...prev, {
          id: Date.now(),
          key,
          value,
          type,
          updatedAt: new Date().toISOString()
        }];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await api.post('/api/admin/config', { settings });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'System settings updated successfully in real-time!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const getSettingValue = (key: string, defaultValue: any) => {
    const s = settings.find(i => i.key === key);
    return s ? s.value : defaultValue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-600 font-medium">Loading system configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-gray-600 mt-1">Enable or disable features and manage global settings in real-time.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Security & Authentication */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Security & Authentication</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
              <div>
                <h3 className="font-bold text-gray-900">OTP Verification</h3>
                <p className="text-sm text-gray-600">If disabled, users can log in or purchase services without email OTP verification.</p>
              </div>
              <button
                onClick={() => handleToggle('ENABLE_OTP', getSettingValue('ENABLE_OTP', true))}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                  getSettingValue('ENABLE_OTP', true) ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    getSettingValue('ENABLE_OTP', true) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
              <div>
                <h3 className="font-bold text-gray-900">Referral System</h3>
                <p className="text-sm text-gray-600">Enable or disable the entire referral and rewards module.</p>
              </div>
              <button
                onClick={() => handleToggle('ENABLE_REFERRAL', getSettingValue('ENABLE_REFERRAL', true))}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                  getSettingValue('ENABLE_REFERRAL', true) ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    getSettingValue('ENABLE_REFERRAL', true) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Global Communication */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Mail size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Communication & Support</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Support Email</label>
              <input
                type="email"
                value={getSettingValue('SUPPORT_EMAIL', 'help@gsttaxwale.com')}
                onChange={(e) => handleChange('SUPPORT_EMAIL', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Contact Phone</label>
              <input
                type="text"
                value={getSettingValue('CONTACT_PHONE', '+91 9666965432')}
                onChange={(e) => handleChange('CONTACT_PHONE', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Zap size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Maintenance</h2>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900">Maintenance Mode</h3>
              <p className="text-sm text-gray-600">Put the site in maintenance mode. Only admins will be able to access.</p>
            </div>
            <button
              onClick={() => handleToggle('MAINTENANCE_MODE', getSettingValue('MAINTENANCE_MODE', false))}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                getSettingValue('MAINTENANCE_MODE', false) ? 'bg-orange-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  getSettingValue('MAINTENANCE_MODE', false) ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        All changes are applied instantly across the platform once saved.
      </div>
    </div>
  );
}
