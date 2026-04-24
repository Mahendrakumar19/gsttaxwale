'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Home, Phone, LogOut } from 'lucide-react';
import { adminAuth } from '@/lib/adminAuth';

export default function AdminHeader() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const adminUser = adminAuth.getAdminUser();
    if (adminUser) {
      setUser(adminUser);
    }
  }, []);

  const handleLogout = () => {
    adminAuth.clearAdmin();
    window.location.href = '/admin';
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center font-bold text-white">₹</div>
            <span className="text-xl font-bold text-blue-900">GST Tax Wale</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center font-bold text-white">₹</div>
            <span className="text-lg font-bold text-blue-900 hidden sm:block">GST Tax Wale</span>
          </Link>

          {/* Admin Navigation - Simplified */}
          <div className="flex items-center gap-6">
            {/* Home Button */}
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium"
            >
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {/* Contact Button */}
            <Link 
              href="/contact" 
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium"
            >
              <Phone size={18} />
              <span className="hidden sm:inline">Contact</span>
            </Link>

            {/* Dashboard Button - if logged in */}
            {user && (
              <Link 
                href="/admin/dashboard" 
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition shadow-sm"
              >
                Dashboard
              </Link>
            )}

            {/* Logout - if logged in */}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition font-medium"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
