'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, FileText, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('user');
    if (!token) { router.push('/auth/login'); return; }
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setFormData(parsed);
      } catch {}
    }
    setLoading(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        sessionStorage.setItem('user', JSON.stringify(formData));
        setUser(formData);
      }
    } catch {}
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!user) return null;

  const fields = [
    { key: 'name', label: 'Full Name', icon: User, editable: true, type: 'text' },
    { key: 'email', label: 'Email Address', icon: Mail, editable: false, type: 'email' },
    { key: 'phone', label: 'Phone Number', icon: Phone, editable: true, type: 'tel' },
    { key: 'pan', label: 'PAN Number', icon: FileText, editable: true, type: 'text' },
  ];

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account details</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Save</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Edit Profile</button>
          )}
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 mb-4 text-sm">
          <CheckCircle size={16} /> Profile updated successfully
        </div>
      )}

      {/* Avatar + Name Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 mb-4 text-white flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold shrink-0">
          {(user.name || 'U')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-lg leading-tight">{user.name || 'User'}</p>
          <p className="text-blue-100 text-sm">{user.email}</p>
          <span className="inline-block mt-1 text-xs bg-green-400/20 text-green-100 border border-green-300/30 px-2 py-0.5 rounded-full">● Active Account</span>
        </div>
      </div>

      {/* Fields */}
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {fields.map(({ key, label, icon: Icon, editable, type }) => (
          <div key={key} className="px-4 py-3.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <Icon size={13} className="text-blue-500" /> {label}
            </label>
            {isEditing && editable ? (
              <input
                type={type}
                name={key}
                value={formData[key] || ''}
                onChange={handleChange}
                placeholder={`Enter ${label.toLowerCase()}`}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
              />
            ) : (
              <p className="text-sm font-semibold text-gray-900">
                {formData[key] || <span className="text-gray-400 font-normal">Not provided</span>}
                {!editable && <span className="ml-2 text-xs text-gray-400 font-normal">(cannot be changed)</span>}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
