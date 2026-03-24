'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardBody from '@/components/DashboardBody';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData && userData !== 'undefined') {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        // corrupted or invalid JSON stored; remove it and continue
        localStorage.removeItem('user');
        console.warn('Cleared invalid stored user data', err);
      }
    } else if (userData === 'undefined') {
      // remove stringified 'undefined' values that sometimes get stored
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <DashboardSidebar isOpen={sidebarOpen} />
      <div className="flex flex-col flex-1">
        <DashboardHeader
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto">
          <DashboardBody />
        </main>
      </div>
    </div>
  );
}
