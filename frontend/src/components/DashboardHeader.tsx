'use client';

import Link from 'next/link';

interface DashboardHeaderProps {
  user?: any;
  onMenuClick?: () => void;
}

export default function DashboardHeader({
  user,
  onMenuClick,
}: DashboardHeaderProps) {

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-8 py-3">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">₹</div>
          <h1 className="text-2xl font-bold text-blue-600">GST Tax Wale</h1>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/dashboard/returns" className="text-sm text-gray-700 hover:text-blue-600 font-medium transition">
            📊 Returns
          </Link>
          <div className="text-sm text-gray-700 font-medium">
            Welcome, <span className="text-blue-600 font-semibold">{user?.name || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
