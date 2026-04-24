'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Bell, Lock, Eye } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'notifications' | 'security'>('notifications');
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    filingReminders: true,
    taxTips: true,
    promotions: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Invalid user data:', err);
      }
    }

    setLoading(false);
  }, [router]);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      if (res.ok) {
        alert('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert('Failed to change password');
      }
    } catch (err) {
      alert('An error occurred');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />
      <div className="flex">
        {sidebarOpen && <DashboardSidebar isOpen={sidebarOpen} user={user} />}
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-amber-500/30">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-2 px-4 py-3 font-bold transition ${
                  activeTab === 'notifications'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-amber-100 hover:text-amber-300'
                }`}
              >
                <Bell size={20} />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-4 py-3 font-bold transition ${
                  activeTab === 'security'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-amber-100 hover:text-amber-300'
                }`}
              >
                <Lock size={20} />
                Security
              </button>
            </div>

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-6 space-y-4">
                  <SettingToggle
                    label="Email Updates"
                    description="Receive updates about your services"
                    checked={notifications.emailUpdates}
                    onChange={() => handleNotificationChange('emailUpdates')}
                  />
                  <hr className="border-amber-500/20" />
                  <SettingToggle
                    label="Filing Reminders"
                    description="Get reminders for upcoming tax filing deadlines"
                    checked={notifications.filingReminders}
                    onChange={() => handleNotificationChange('filingReminders')}
                  />
                  <hr className="border-amber-500/20" />
                  <SettingToggle
                    label="Tax Tips"
                    description="Receive helpful tax-saving tips and strategies"
                    checked={notifications.taxTips}
                    onChange={() => handleNotificationChange('taxTips')}
                  />
                  <hr className="border-amber-500/20" />
                  <SettingToggle
                    label="Promotions"
                    description="Get notified about special offers and discounts"
                    checked={notifications.promotions}
                    onChange={() => handleNotificationChange('promotions')}
                  />
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-6 space-y-4">
                  <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>

                  <div>
                    <label className="flex items-center gap-2 text-amber-100 text-sm font-medium mb-2">
                      <Lock size={18} className="text-amber-400" />
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-amber-500/30 rounded-lg text-white"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-amber-100 text-sm font-medium mb-2">
                      <Eye size={18} className="text-amber-400" />
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-amber-500/30 rounded-lg text-white"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-amber-100 text-sm font-medium mb-2">
                      <Eye size={18} className="text-amber-400" />
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-amber-500/30 rounded-lg text-white"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition"
                  >
                    Update Password
                  </button>
                </div>

                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
                  <h3 className="text-white font-bold mb-2">Two-Factor Authentication</h3>
                  <p className="text-blue-200 text-sm mb-4">Add an extra layer of security to your account</p>
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition">
                    Enable 2FA
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-amber-200/70 text-sm">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
        />
        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
      </label>
    </div>
  );
}
