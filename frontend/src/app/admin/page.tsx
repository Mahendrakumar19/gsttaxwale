'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuth } from '@/lib/adminAuth';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // If already logged in as admin, redirect to dashboard
    const adminToken = adminAuth.getAdminToken();
    const adminUser = adminAuth.getAdminUser();
    
    if (adminToken && adminUser?.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      // Otherwise redirect to admin login
      router.push('/admin/login');
    }
  }, [router]);

  // Show nothing while redirecting
  return null;
}
