'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText, Download, FileUp, XCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

// ── Constants ──────────────────────────────────────────────────────────────
const FISCAL_YEARS = ['2026-27', '2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];
const MONTHS = ['April','May','June','July','August','September','October','November','December','January','February','March'];
const CATEGORIES = ['GST', 'ITR', 'Others'] as const;
type Category = typeof CATEGORIES[number];

interface DocFile {
  id: number;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  fiscalYear: string;
  month: string | null;
  downloadUrl: string;
  createdAt: string;
  status: string;
}

interface DocsByMonth { [month: string]: DocFile[] }
interface DocsByCategory { GST: DocFile[]; ITR: DocFile[]; Others: DocFile[] }

export default function DocumentsCenter() {
  const [selectedFY, setSelectedFY] = useState('2025-26');
  const [activeTab, setActiveTab] = useState<Category>('GST');
  const [byMonth, setByMonth] = useState<DocsByMonth>({});
  const [byCategory, setByCategory] = useState<DocsByCategory>({ GST: [], ITR: [], Others: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    category: 'GST' as Category,
    month: '',
    files: [] as { file: File; title: string }[],
  });

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/dashboard/user/documents', { params: { fy: selectedFY } });
      const data = res.data?.data || {};
      setByMonth(data.byMonth || {});
      setByCategory({
        GST: data.byCategory?.GST || [],
        ITR: data.byCategory?.ITR || [],
        Others: data.byCategory?.Others || [],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [selectedFY]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = async (doc: DocFile) => {
    try {
      const filename = doc.fileName;
      const res = await api.get(`/api/documents/download/${filename}`, { responseType: 'blob' });
      const rawContentType = res.headers['content-type'];
      const contentType: string = (typeof rawContentType === 'string' ? rawContentType : doc.fileType) || 'application/octet-stream';
      const url = window.URL.createObjectURL(new Blob([res.data], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;
      // Preserve original extension from fileName
      const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '';
      let downloadName = doc.title || filename;
      if (ext && !downloadName.toLowerCase().endsWith(ext.toLowerCase())) {
        downloadName += ext;
      }
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed. Please try again.');
    }
  };

  // ── Upload ────────────────────────────────────────────────────────────────
  const addFiles = (fl: FileList | null) => {
    if (!fl) return;
    const added = Array.from(fl).map(f => ({ file: f, title: f.name.replace(/\.[^/.]+$/, '') }));
    setUploadForm(p => ({ ...p, files: [...p.files, ...added] }));
  };

  const removeFile = (i: number) =>
    setUploadForm(p => ({ ...p, files: p.files.filter((_, idx) => idx !== i) }));

  const updateTitle = (i: number, t: string) =>
    setUploadForm(p => {
      const f = [...p.files]; f[i].title = t; return { ...p, files: f };
    });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadForm.files.length === 0) { alert('Select at least one file'); return; }
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('customerId', 'me');
      fd.append('category', uploadForm.category);
      fd.append('fiscalYear', selectedFY);
      if (uploadForm.month) fd.append('month', uploadForm.month);
      uploadForm.files.forEach(f => {
        fd.append('files', f.file);
        fd.append('displayTitle', f.title);
      });
      await api.post('/api/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowUploadModal(false);
      setUploadForm({ category: 'GST', month: '', files: [] });
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const categoryDocs = byCategory[activeTab] || [];
  const categoryByMonth: DocsByMonth = {};
  MONTHS.forEach(m => {
    const docs = (byMonth[m] || []).filter(d => {
      const cat = d.category?.toUpperCase();
      if (activeTab === 'GST') return cat === 'GST';
      if (activeTab === 'ITR') return cat === 'ITR';
      return !['GST', 'ITR'].includes(cat);
    });
    if (docs.length > 0) categoryByMonth[m] = docs;
  });
  const generalDocs = (byMonth['General'] || []).filter(d => {
    const cat = d.category?.toUpperCase();
    if (activeTab === 'GST') return cat === 'GST';
    if (activeTab === 'ITR') return cat === 'ITR';
    return !['GST', 'ITR'].includes(cat);
  });

  const getFileIcon = (fileType: string) => {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📄';
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '–';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Documents Center</h3>
            <p className="text-xs text-gray-500">Tax documents organized by month &amp; year</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Fiscal Year Selector */}
          <select
            value={selectedFY}
            onChange={e => setSelectedFY(e.target.value)}
            className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white font-medium text-gray-700"
          >
            {FISCAL_YEARS.map(fy => (
              <option key={fy} value={fy}>FY {fy}</option>
            ))}
          </select>
          {/* Upload Button */}
          <button
            onClick={() => { setUploadForm(p => ({ ...p, category: activeTab, month: '' })); setShowUploadModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <FileUp size={16} />
            Upload
          </button>
        </div>
      </div>

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileUp size={22} className="text-blue-600" /> Upload Documents
              </h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} type="button"
                      onClick={() => setUploadForm(p => ({ ...p, category: cat }))}
                      className={`py-2 text-xs font-bold rounded-lg border transition ${
                        uploadForm.category === cat
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >{cat}</button>
                  ))}
                </div>
              </div>

              {/* Month (optional) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Compliance Month <span className="font-normal text-gray-400">(optional)</span></label>
                <select
                  value={uploadForm.month}
                  onChange={e => setUploadForm(p => ({ ...p, month: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">-- General / No Month --</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Files */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Files</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {uploadForm.files.map((f, i) => (
                    <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-xl relative group">
                      <button type="button" onClick={() => removeFile(i)}
                        className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition">
                        <XCircle size={16} />
                      </button>
                      <p className="text-[10px] text-gray-400 truncate mb-1 pr-6">{f.file.name}</p>
                      <input type="text" value={f.title}
                        onChange={e => updateTitle(i, e.target.value)}
                        placeholder="Display name"
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  ))}
                  <div className="relative group">
                    <input type="file" multiple onChange={e => addFiles(e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="py-7 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center group-hover:border-blue-300 group-hover:bg-blue-50/50 transition-all">
                      <FileUp size={26} className="text-gray-300 group-hover:text-blue-500 mb-1" />
                      <span className="text-xs font-bold text-gray-400 group-hover:text-blue-600">Click to add files</span>
                      <span className="text-[10px] text-gray-300 mt-0.5">PDF, Word, Excel, Image — up to 50MB each</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isUploading || uploadForm.files.length === 0}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-bold text-sm">
                  {isUploading ? 'Uploading…' : `Upload ${uploadForm.files.length} File${uploadForm.files.length !== 1 ? 's' : ''}`}
                </button>
                <button type="button" onClick={() => setShowUploadModal(false)}
                  className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition font-bold text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── Category Tabs ── */}
      <div className="flex border-b border-gray-100 px-6 pt-4">
        {CATEGORIES.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold transition border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {tab}
            {byCategory[tab].length > 0 && (
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
              }`}>{byCategory[tab].length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : categoryDocs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No {activeTab} documents found</p>
            <p className="text-gray-400 text-sm mt-1">for FY {selectedFY}</p>
            <button
              onClick={() => { setUploadForm(p => ({ ...p, category: activeTab, month: '' })); setShowUploadModal(true); }}
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Upload {activeTab} Documents
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Month-wise grid */}
            {MONTHS.filter(m => categoryByMonth[m]?.length > 0).map(month => (
              <div key={month}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">{month}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 font-medium">{categoryByMonth[month].length} file{categoryByMonth[month].length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryByMonth[month].map(doc => (
                    <DocumentCard key={doc.id} doc={doc} onDownload={() => handleDownload(doc)}
                      getFileIcon={getFileIcon} formatSize={formatSize} />
                  ))}
                </div>
              </div>
            ))}

            {/* General (no month) */}
            {generalDocs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">General</span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 font-medium">{generalDocs.length} file{generalDocs.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {generalDocs.map(doc => (
                    <DocumentCard key={doc.id} doc={doc} onDownload={() => handleDownload(doc)}
                      getFileIcon={getFileIcon} formatSize={formatSize} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Document Card Component ────────────────────────────────────────────────
function DocumentCard({ doc, onDownload, getFileIcon, formatSize }: {
  doc: DocFile;
  onDownload: () => void;
  getFileIcon: (t: string) => string;
  formatSize: (b: number) => string;
}) {
  return (
    <div className="group flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-default">
      <div className="text-2xl shrink-0 select-none">{getFileIcon(doc.fileType)}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{doc.title || doc.fileName}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatSize(doc.fileSize)} · {new Date(doc.createdAt).toLocaleDateString('en-IN')}</p>
      </div>
      <button
        onClick={onDownload}
        className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition opacity-0 group-hover:opacity-100"
        title="Download"
      >
        <Download size={16} />
      </button>
    </div>
  );
}
