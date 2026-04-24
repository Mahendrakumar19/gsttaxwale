'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, FileText, Lock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfileTab() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/auth/login');
  };

  if (!user) return <div className="py-12 text-center text-gray-400 text-sm">Loading profile...</div>;

  const data = [
    { icon: User, label: 'Name', value: user.name },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone || 'Not provided' },
    { icon: FileText, label: 'PAN', value: user.pan || 'Not provided' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
          {user.name?.[0].toUpperCase()}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 leading-tight">{user.name}</h3>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">{user.role || 'Client'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {data.map((item, idx) => (
          <div key={idx} className="bg-white border border-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                <item.icon size={16} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition text-sm font-bold">
          <Lock size={16} />
          Change Password
        </button>
        <button 
          onClick={handleLogout}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition text-sm font-bold"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-gray-400">Account ID: {user.id || 'N/A'}</p>
      </div>
    </div>
  );
}
