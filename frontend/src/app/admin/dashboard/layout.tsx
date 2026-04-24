"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuth } from '@/lib/adminAuth';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is authenticated
    const checkAdminAuth = () => {
      const token = adminAuth.getAdminToken();
      const user = adminAuth.getAdminUser();

      if (token && user?.role === 'admin') {
        setIsAdmin(true);
      } else {
        // Redirect to admin login if not admin
        router.replace('/admin');
      }
      setLoading(false);
    };

    checkAdminAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          <p className="text-gray-600 text-lg mt-4">Verifying permissions…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Router will redirect
  }

  return <>{children}</>;
}
