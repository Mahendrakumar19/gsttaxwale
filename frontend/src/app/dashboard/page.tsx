'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardTabs from '@/components/DashboardTabs';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const userData = sessionStorage.getItem('user');
    if (userData && userData !== 'undefined') {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        sessionStorage.removeItem('user');
        console.warn('Cleared invalid stored user data', err);
      }
    } else if (userData === 'undefined') {
      sessionStorage.removeItem('user');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />
      <main className="py-6">
        <DashboardTabs />
      </main>
    </div>
  );
}
