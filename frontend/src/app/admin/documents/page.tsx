'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuth } from '@/lib/adminAuth';
import AdminDocumentUpload from '@/components/admin/AdminDocumentUpload';

export default function AdminDocumentsPage() {
  const router = useRouter();

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();

    if (!token || user?.role !== 'admin') {
      router.push('/admin');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <AdminDocumentUpload />
      </div>
    </div>
  );
}

