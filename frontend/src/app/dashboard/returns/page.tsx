'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReturnSummary from '@/components/ReturnSummary';
import axios from 'axios';

export default function ReturnsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setIsAuthenticated(true);
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

  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">GST & Tax Returns</h1>
          <p className="text-gray-500 text-xs mt-1">Track, review, and download your compliance returns in real time</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{documents.length}</p>
              <p className="text-blue-500 text-[10px] mt-2 font-semibold">✓ Real-time sync active</p>
            </div>
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">GST Filings Found</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {documents.filter(d => d.category?.toUpperCase() === 'GST').length}
              </p>
              <p className="text-emerald-600 text-[10px] mt-2 font-semibold">Mapped in GST Return matrix</p>
            </div>
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">ITR Forms Found</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {documents.filter(d => d.category?.toUpperCase() === 'ITR').length}
              </p>
              <p className="text-purple-600 text-[10px] mt-2 font-semibold">Mapped in ITR ledger matrix</p>
            </div>
          </div>

          {/* Return Summary Table */}
          <ReturnSummary documents={documents} onDownload={handleDownload} />

          {/* Important Dates */}
          <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Compliance Calendars & Guidelines</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-3 border-b border-gray-100">
                <div className="text-blue-600 font-extrabold text-xs uppercase tracking-wider w-20">GSTR 1</div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">Monthly Return Due: 11th of next month</p>
                  <p className="text-xs text-gray-500">Statement of outward supplies, applies to standard taxpayers</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-3 border-b border-gray-100">
                <div className="text-blue-600 font-extrabold text-xs uppercase tracking-wider w-20">GSTR 3B</div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">Monthly Return Due: 20th of next month</p>
                  <p className="text-xs text-gray-500">Monthly self-declared summary return with ITC reconciliations</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-blue-600 font-extrabold text-xs uppercase tracking-wider w-20">GSTR 9 / 9C</div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">Annual Audit Due: 31st Dec following Financial Year</p>
                  <p className="text-xs text-gray-500">Annual reconciliation statement for registered businesses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
