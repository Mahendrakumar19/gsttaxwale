'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { adminAuth } from '@/lib/adminAuth';
import { ChevronDown, Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  adminUser: any;
}

export default function AdminLayout({ children, adminUser }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Services', href: '/admin/services', icon: '⚙️' },
    { label: 'Documents', href: '/admin/documents', icon: '📄' },
    { label: 'Orders', href: '/admin/orders', icon: '📦' },
    { label: 'Users & Plans', href: '/admin/users', icon: '👥' },
    { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
  ];

  const isActive = (href: string) => pathname === href;

  function handleLogout() {
    adminAuth.clearAdmin();
    router.push('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 shadow-sm transition-all duration-300 sticky top-0 h-screen flex flex-col`}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              ₹
            </div>
            {sidebarOpen && <h1 className="text-lg font-bold text-blue-600">Admin</h1>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 px-3 py-3">
          {sidebarOpen && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 truncate">Logged in as</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{adminUser?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
          >
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Admin Control Center</h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{adminUser?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-600">{adminUser?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
