'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { FileText, Download, Calendar, HardDrive, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function YourDocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({});

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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/documents/my-documents`,
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
    const fileKey = `${downloadUrl}`;
    setDownloading((prev) => ({ ...prev, [fileKey]: true }));
    
    try {
      const token = localStorage.getItem('token');
      const config: { headers: { Authorization: string }; responseType: 'blob' } = {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      };

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${downloadUrl}`,
        config as any
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download document');
    } finally {
      setDownloading((prev) => ({ ...prev, [fileKey]: false }));
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex">
      <DashboardSidebar isOpen={sidebarOpen} user={user} />

      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg">
                <FileText className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Your Documents</h1>
                <p className="text-slate-300 mt-1">All documents available for you</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300/80 text-sm font-semibold">Total Documents</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">{documents.length}</p>
                </div>
                <FileText className="text-blue-400/40" size={40} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300/80 text-sm font-semibold">Total Size</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">
                    {formatFileSize(documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0))}
                  </p>
                </div>
                <HardDrive className="text-purple-400/40" size={40} />
              </div>
            </div>
          </div>

          {/* Documents List */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              <p className="text-slate-300 mt-4">Loading your documents...</p>
            </div>
          )}

          {!loading && documents.length === 0 && (
            <div className="bg-slate-800/30 border border-slate-600/50 rounded-lg p-12 text-center">
              <AlertCircle className="mx-auto mb-4 text-slate-400" size={48} />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No Documents Yet</h3>
              <p className="text-slate-400">The admin will upload your documents here. Check back soon!</p>
            </div>
          )}

          {!loading && documents.length > 0 && (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4 hover:border-slate-500/60 transition-all hover:bg-slate-800/70 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 bg-blue-900/30 rounded-lg flex-shrink-0 group-hover:bg-blue-900/50 transition">
                      <FileText className="text-blue-400" size={24} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{doc.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <HardDrive size={14} />
                          {formatFileSize(doc.fileSize)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <span className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded text-xs font-medium border border-blue-500/20 capitalize">
                          {doc.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(doc.downloadUrl, doc.title)}
                    disabled={downloading[doc.id]}
                    className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold flex-shrink-0 whitespace-nowrap"
                  >
                    <Download size={18} />
                    <span className="hidden sm:inline">
                      {downloading[doc.id] ? 'Downloading...' : 'Download'}
                    </span>
                    <span className="sm:hidden">{downloading[doc.id] ? '...' : 'Get'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
