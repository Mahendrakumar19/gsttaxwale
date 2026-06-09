'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import ReturnSummary from '@/components/ReturnSummary';
import { FileText, Plus, X } from 'lucide-react';
import axios from 'axios';

export default function YourDocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    type: 'document',
    batchName: '',
    files: [] as { file: File, title: string }[],
  });
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
      const mimeType = typeof contentType === 'string' ? contentType : 'application/pdf';
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

  const addFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles).map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, "")
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
    if (uploadForm.files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('customerId', 'me');
      formData.append('category', uploadForm.type);
      formData.append('batchName', uploadForm.batchName || '');
      
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
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/documents/upload`,
        formData,
        config
      );

      if (token) loadDocuments(token); // Refresh list
      setShowUploadModal(false);
      setUploadForm({ type: 'document', batchName: '', files: [] });
      alert('Documents uploaded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar isOpen={sidebarOpen} user={user} />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <FileText size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Your Documents</h1>
                  <p className="text-gray-500 text-xs mt-0.5">Upload and manage compliance documents and files</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowUploadModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-sm"
              >
                <Plus size={18} />
                Upload New
              </button>
            </div>
          </div>

          {/* Return Summary Matrix Grid */}
          <div className="mb-10">
            {loading ? (
              <div className="text-center py-16 bg-white border border-blue-100 rounded-3xl shadow-sm">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 text-sm mt-4 font-medium">Loading documents...</p>
              </div>
            ) : (
              <ReturnSummary documents={documents} onDownload={handleDownload} />
            )}
          </div>

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
              <div className="bg-white border border-blue-100 rounded-3xl p-6 max-w-md w-full shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Upload Documents</h2>
                  <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600 transition p-1">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                    <select
                      value={uploadForm.type}
                      onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="document">General Document</option>
                      <option value="itr">ITR Related</option>
                      <option value="gst">GST Related</option>
                      <option value="proof">ID Proof</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Document Group Name</label>
                    <input
                      type="text"
                      placeholder="e.g. My Pan & Aadhaar, ITR Files"
                      value={uploadForm.batchName}
                      onChange={(e) => setUploadForm({ ...uploadForm, batchName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Files</label>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                      {uploadForm.files.map((f, idx) => (
                        <div key={idx} className="p-3 bg-blue-50/40 border border-blue-100/50 rounded-xl relative group">
                          <button 
                            type="button" 
                            onClick={() => removeFile(idx)}
                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={15} />
                          </button>
                          <p className="text-[10px] text-gray-500 truncate mb-1 pr-6 font-semibold">{f.file.name}</p>
                          <input
                            type="text"
                            value={f.title}
                            onChange={(e) => updateFileTitle(idx, e.target.value)}
                            placeholder="File Title"
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:border-blue-500 outline-none transition-colors"
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
                        <div className="py-6 border-2 border-dashed border-blue-100 rounded-2xl flex flex-col items-center justify-center group-hover:border-blue-400 bg-gray-50/50 hover:bg-white transition-all cursor-pointer">
                          <Plus size={20} className="text-blue-500 mb-1" />
                          <span className="text-xs text-gray-500 font-bold">Add Files (Multiple)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      disabled={isUploading || uploadForm.files.length === 0}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-bold text-xs shadow-sm shadow-blue-500/10"
                    >
                      {isUploading ? 'Uploading...' : `Upload ${uploadForm.files.length} File${uploadForm.files.length !== 1 ? 's' : ''}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
