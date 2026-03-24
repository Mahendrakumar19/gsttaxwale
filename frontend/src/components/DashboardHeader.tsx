'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  user?: any;
  onMenuClick?: () => void;
}

export default function DashboardHeader({
  user,
  onMenuClick,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <header className="bg-gradient-to-r from-slate-800/80 to-blue-900/80 shadow-lg border-b border-amber-500/30 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-slate-700/50 rounded-lg text-amber-400 transition"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text">GST Tax Wale</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700/50 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-medium text-amber-200">{user?.name || 'User'}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-amber-500/30 z-50 backdrop-blur">
                <div className="p-4 border-b border-amber-500/20">
                  <p className="text-sm font-semibold text-amber-300">{user?.name}</p>
                  <p className="text-xs text-amber-200/70">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-amber-400 hover:bg-amber-900/30 text-sm font-medium transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
