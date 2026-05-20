'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { FileText } from 'lucide-react';
import ReturnSummary from '@/components/ReturnSummary';
import axios from 'axios';

export default function YourDocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData || '{}');
    setUser(parsedUser);
    loadDocuments(token);
  }, [router]);

  async function loadDocuments(token: string) {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/documents/user-list`,
        config
      );
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(downloadUrl: string, fileName: string) {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' as const,
      };

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || ''}${downloadUrl}`,
        config
      );

      const contentType = response.headers['content-type'];
      const mimeType = typeof contentType === 'string' ? contentType : 'application/octet-stream';
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download document');
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar isOpen={sidebarOpen} user={user} />

      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Documents</h1>
                <p className="text-gray-500 text-xs mt-0.5">All compliance documents and returns available for download</p>
              </div>
            </div>
          </div>

          {/* Return Summary Section - Grid View and Dropdowns */}
          <div className="mb-10">
            {loading ? (
              <div className="text-center py-16 bg-white border border-blue-100 rounded-3xl shadow-sm">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 text-sm mt-4 font-medium">Loading compliance records...</p>
              </div>
            ) : (
              <ReturnSummary documents={documents} onDownload={handleDownload} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
