'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  user?: any;
  onMenuClick?: () => void;
}

export default function DashboardHeader({
  user,
  onMenuClick,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-8 py-3">
        <Link href="/" className="hover:opacity-80 transition py-1">
          <img src="/gsttaxwale_logo.svg" alt="GST Tax Wale" className="h-12 w-auto" />
        </Link>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold transition"
          >
            <LogOut size={16} />
            Logout
          </button>
          <div className="text-sm text-gray-700 font-medium">
            Welcome, <span className="text-blue-600 font-semibold">{user?.name || 'User'}</span>
          </div>
        </div>

        {/* Logout Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-gray-100">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Confirm Logout</h3>
              <p className="text-gray-600 mb-8 text-center">Are you sure you want to sign out of your account?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 transition font-bold shadow-lg shadow-red-200"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
