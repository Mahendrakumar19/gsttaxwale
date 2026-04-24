"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuth } from '@/lib/adminAuth';

export default function AdminServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();

    if (token && user?.role === 'admin') {
      setIsAdmin(true);
      setLoading(false);
    } else {
      router.push('/admin');
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-lg">Verifying permissions…</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
