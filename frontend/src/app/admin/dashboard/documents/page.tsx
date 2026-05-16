"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { FileText, Download, Trash2, Upload, ArrowLeft, X, Plus } from 'lucide-react';

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
    type: 'document',
    files: [] as { file: File, title: string }[],
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
      setDocuments(res.data.data || []);
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

  const addFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles).map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, "") // Default title to filename without extension
    }));
    setUploadForm(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const removeFile = (index: number) => {
    setUploadForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const updateFileTitle = (index: number, title: string) => {
    setUploadForm(prev => {
      const newFiles = [...prev.files];
      newFiles[index].title = title;
      return { ...prev, files: newFiles };
    });
  };

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (uploadForm.files.length === 0 || !uploadForm.userId) {
      alert('Please select a user and at least one file');
      return;
    }

    setUploading(true);
    try {
      const token = adminAuth.getAdminToken();
      const formData = new FormData();
      formData.append('customerId', uploadForm.userId);
      formData.append('type', uploadForm.type);
      
      uploadForm.files.forEach(f => {
        formData.append('files', f.file);
        formData.append('displayTitle', f.title);
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/upload-document`,
        formData,
        config
      );

      if (token) loadDocuments(token); // Refresh list
      setShowUploadModal(false);
      setUploadForm({ userId: '', type: 'document', files: [] });
      alert('Documents uploaded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
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
    <div className="px-6 py-10 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full uppercase tracking-widest">Document Vault</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Manage Documents</h1>
          <p className="text-slate-500 font-medium mt-1">Review and organize customer tax filings and identity proofs</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs"
        >
          <Upload size={18} />
          Bulk Upload Engine
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 max-w-xl w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Upload Documents</h2>
                <p className="text-xs text-slate-500 font-medium">Add files to customer records</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Customer</label>
                <select
                  value={uploadForm.userId}
                  onChange={(e) => setUploadForm({ ...uploadForm, userId: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                  required
                >
                  <option value="">Choose target user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.pan || user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Queue Management</label>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {uploadForm.files.map((f, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] relative group transition-all hover:bg-white hover:border-blue-300">
                      <button 
                        type="button" 
                        onClick={() => removeFile(idx)}
                        className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                      <p className="text-[10px] text-slate-400 font-bold truncate mb-2 pr-10">{f.file.name}</p>
                      <input
                        type="text"
                        value={f.title}
                        onChange={(e) => updateFileTitle(idx, e.target.value)}
                        placeholder="Document Title (e.g. PAN Card Front)"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  ))}

                  <div className="relative group">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => addFiles(e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="py-10 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-50/50 transition-all">
                      <Plus size={32} className="text-slate-300 group-hover:text-blue-500 mb-2 transition-transform group-hover:rotate-90 duration-500" />
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-widest">Append Files to Queue</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Category</label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                >
                  <option value="document">General Document</option>
                  <option value="certificate">GST Certificate</option>
                  <option value="return">Tax Return Filing</option>
                  <option value="receipt">Payment Receipt</option>
                  <option value="proof">Identity Proof</option>
                </select>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={uploading || uploadForm.files.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs disabled:opacity-50"
                >
                  {uploading ? 'SYNCING...' : `COMMIT ${uploadForm.files.length} UPLOAD(S)`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-8 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black transition uppercase tracking-widest text-xs"
                >
                  Abort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Meta</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner / Target</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">File Details</th>
                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="text-right px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">📂</div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Repository Empty</h3>
                    <p className="text-slate-500 font-medium">No documents have been synchronized yet</p>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-blue-600 group-hover:rotate-6 transition-transform">
                          <FileText size={24} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-tight leading-none mb-1 uppercase text-sm">{doc.title || 'Untitled Sync'}</p>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded uppercase tracking-widest">{doc.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-900">{doc.userName}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.userEmail || 'Internal Link'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-600 truncate max-w-[200px]">{doc.fileName}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-600">{new Date(doc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-3 bg-white text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition active:scale-95 border border-slate-100"
                          title="View Stream"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={deleting[doc.id]}
                          className="p-3 bg-white text-red-500 hover:bg-red-600 hover:text-white rounded-xl shadow-sm transition active:scale-95 border border-slate-100 disabled:opacity-50"
                          title="Purge Object"
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
