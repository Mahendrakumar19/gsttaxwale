'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, FileText, Shield, Key, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export default function ProfileTab() {
  const [user, setUser] = useState<any>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    }
  }, []);

  if (!user) return <div className="py-12 text-center text-gray-400 text-sm">Loading profile...</div>;

  const data = [
    { icon: User, label: 'Full Name', value: user.name },
    { icon: Mail, label: 'Email Address', value: user.email },
    { icon: Phone, label: 'Mobile Number', value: user.phone || 'Not provided' },
    { icon: FileText, label: 'PAN Number', value: user.pan || 'Not provided' },
    { icon: Shield, label: 'Account Role', value: user.role || 'Client' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg">
              <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-3xl font-bold">
                {user.name?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">Member since {new Date().getFullYear()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center gap-2 text-gray-400">
                  <item.icon size={14} />
                  <p className="text-[10px] uppercase font-bold tracking-widest">{item.label}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition-colors border border-blue-200"
              >
                <Key size={18} />
                Change Password
              </button>
            ) : (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Lock size={18} className="text-blue-600" /> Change Password
                  </h4>
                  <button 
                    onClick={() => {
                      setIsChangingPassword(false);
                      setMessage(null);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                
                {message && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 mb-4 text-sm font-medium ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                  </div>
                )}
                
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (newPassword !== confirmPassword) {
                      setMessage({ type: 'error', text: 'New passwords do not match' });
                      return;
                    }
                    if (newPassword.length < 6) {
                      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
                      return;
                    }
                    
                    setIsLoading(true);
                    setMessage(null);
                    
                    try {
                      const res = await api.post('/api/auth/change-password', {
                        oldPassword,
                        newPassword
                      });
                      
                      setMessage({ type: 'success', text: 'Password changed successfully!' });
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      
                      setTimeout(() => setIsChangingPassword(false), 2000);
                    } catch (err: any) {
                      setMessage({ 
                        type: 'error', 
                        text: err.response?.data?.message || err.response?.data?.error || 'Failed to change password. Please check your old password.' 
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Old Password</label>
                    <input 
                      type="password" 
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
