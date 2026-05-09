'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, FileText, Shield } from 'lucide-react';

export default function ProfileTab() {
  const [user, setUser] = useState<any>(null);

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
            <div className="flex items-center gap-3 text-orange-600 bg-orange-50 p-4 rounded-xl border border-orange-100">
              <Shield size={20} className="shrink-0" />
              <p className="text-xs leading-relaxed font-medium">
                This is a read-only compliance account. Profile information can only be updated by the admin team to ensure compliance integrity. 
                Contact support if you need to update your details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
