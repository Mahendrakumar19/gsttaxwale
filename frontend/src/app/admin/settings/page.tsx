'use client';
import React, { useState } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'GST Tax Wale',
    supportEmail: 'support@gsttaxwale.com',
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Settings</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
