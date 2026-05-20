"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { FileText, Download, Trash2, Upload, ArrowLeft, X } from 'lucide-react';

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<{[key: string]: boolean}>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    userId: '',
    title: '',
    category: 'GST',
    fiscalYear: '2025-26',
    file: null as File | null,
  });

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    if (!token) {
      router.push('/admin');
      return;
    }

    loadDocuments(token);
    loadUsers(token);
  }, [router]);

  async function loadDocuments(token: string) {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/documents`,
        config
      );
      setDocuments(res.data.data?.documents || res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers(token: string) {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/customers`,
        config
      );
      setUsers(res.data.data || []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.userId || !uploadForm.title) {
      alert('Please fill all fields');
      return;
    }

    setUploading(true);
    try {
      const token = adminAuth.getAdminToken();
      const formData = new FormData();
      formData.append('files', uploadForm.file);
      formData.append('customerId', uploadForm.userId);
      formData.append('displayTitle', uploadForm.title);
      formData.append('category', uploadForm.category);
      formData.append('fiscalYear', uploadForm.fiscalYear);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/documents/upload`,
        formData,
        config
      );

      if (token) loadDocuments(token);
      setShowUploadModal(false);
      setUploadForm({ userId: '', title: '', category: 'GST', fiscalYear: '2025-26', file: null });
      alert('Document uploaded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(downloadUrl: string, fileName: string) {
    if (!downloadUrl) {
      alert('Download URL not available');
      return;
    }
    try {
      const token = adminAuth.getAdminToken();
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
      const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
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
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm('Are you sure you want to delete this document?')) return;

    setDeleting((prev) => ({ ...prev, [docId]: true }));
    try {
      const token = adminAuth.getAdminToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/documents/${docId}`,
        config
      );

      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (err: any) {
      alert('Failed to delete document');
    } finally {
      setDeleting((prev) => ({ ...prev, [docId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="hover:text-purple-400 transition">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <FileText size={32} className="text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold">Documents</h1>
              <p className="text-slate-400">Manage user documents</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition font-semibold"
        >
          <Upload size={20} />
          Upload Document
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Upload Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Select User
                </label>
                <select
                  value={uploadForm.userId}
                  onChange={(e) => setUploadForm({ ...uploadForm, userId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g., GST Certificate 2026"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Category (Grid View Location)
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="GST">GST Returns</option>
                  <option value="ITR">Income Tax Returns (ITR)</option>
                  <option value="Others">Others / General compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Financial Year
                </label>
                <select
                  value={uploadForm.fiscalYear}
                  onChange={(e) => setUploadForm({ ...uploadForm, fiscalYear: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="2021-22">2021-22</option>
                  <option value="2022-23">2022-23</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2024-25">2024-25</option>
                  <option value="2025-26">2025-26</option>
                  <option value="2026-27">2026-27</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  File (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 file:text-white file:bg-purple-600 file:border-0 file:rounded file:cursor-pointer"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition disabled:opacity-50 font-semibold"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">File Name & Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">FY</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Size</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Uploaded</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No documents found
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-700/20 transition">
                    <td className="px-6 py-4 font-mono text-sm">
                      <div className="font-bold text-white">{doc.title || 'Untitled'}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{doc.fileName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{doc.customerName || 'N/A'}</div>
                      {doc.customerPan && <div className="text-xs text-slate-500 mt-0.5 uppercase">PAN: {doc.customerPan}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs capitalize">
                        {doc.category || 'Others'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {doc.fiscalYear || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {(doc.fileSize / 1024).toFixed(2)} KB
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownload(doc.downloadUrl, doc.title || doc.fileName)}
                          className="p-2 hover:bg-slate-700 rounded transition text-slate-400 hover:text-blue-400"
                          title="Download File"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={deleting[doc.id]}
                          className="p-2 hover:bg-slate-700 rounded transition text-slate-400 hover:text-red-400 disabled:opacity-50"
                          title="Delete Document"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
