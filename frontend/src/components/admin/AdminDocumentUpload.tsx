'use client';

import { useState, useEffect } from 'react';
import { Upload, Trash2, FileText, Search, Download, Calendar, Loader2, AlertCircle, Clock, Shield, Database, LayoutGrid } from 'lucide-react';
import api from '@/lib/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  pan: string;
}

interface DocumentUpload {
  id: string;
  fileName: string;
  customerId: string;
  customerName: string;
  customerPan: string;
  fiscalYear: string;
  category: string;
  status: 'active' | 'archived';
  uploadedAt: string;
  fileSize: number;
}

export default function AdminDocumentUpload() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fiscalYears = [
    'FY2023-24',
    'FY2024-25',
    'FY2025-26',
    'FY2026-27',
  ];

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPan: '',
    fiscalYear: 'FY2025-26',
    category: 'gst',
    files: [] as { file: File, title: string }[],
  });

  useEffect(() => {
    fetchCustomers();
    fetchDocuments();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      const users = response.data.data?.users || response.data.data || [];
      const customersList = users.map((user: any) => ({
        id: user.id.toString(),
        name: (user.name || ((user.firstName || '') + ' ' + (user.lastName || '')).trim()),
        email: user.email,
        phone: user.phone || 'N/A',
        pan: user.pan || 'N/A',
      }));
      setCustomers(customersList);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError('Failed to load customers');
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/api/admin/documents');
      setDocuments(response.data.data?.documents || response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const selected = customers.find(c => c.id === customerId);
    if (selected) {
      setFormData({
        ...formData,
        customerId: selected.id,
        customerName: selected.name,
        customerPan: selected.pan,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles).map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, "")
    }));

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
    setError('');
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const updateFileTitle = (index: number, title: string) => {
    setFormData(prev => {
      const newFiles = [...prev.files];
      newFiles[index].title = title;
      return { ...prev, files: newFiles };
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.customerId || formData.files.length === 0) {
      setError('Please select a customer and at least one file');
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('customerId', formData.customerId);
      uploadFormData.append('customerName', formData.customerName);
      uploadFormData.append('customerPan', formData.customerPan);
      uploadFormData.append('fiscalYear', formData.fiscalYear);
      uploadFormData.append('category', formData.category);
      
      formData.files.forEach(f => {
        uploadFormData.append('files', f.file);
        uploadFormData.append('displayTitle', f.title);
      });

      await api.post('/api/admin/documents/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(`${formData.files.length} document(s) uploaded successfully for ${formData.customerName}`);
      setFormData({
        customerId: '',
        customerName: '',
        customerPan: '',
        fiscalYear: 'FY2025-26',
        category: 'gst',
        files: [],
      });

      await fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: any) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/api/admin/documents/${docId}`);
      setDocuments(documents.filter((doc) => String(doc.id) !== String(docId)));
      setSuccess('Document deleted successfully');
      setTimeout(() => fetchDocuments(), 500);
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const handleArchive = async (docId: any) => {
    try {
      await api.patch(`/api/admin/documents/${docId}/archive`, {});
      setDocuments(
        documents.map((doc) =>
          String(doc.id) === String(docId) ? { ...doc, status: 'archived' } : doc
        )
      );
    } catch (err) {
      setError('Failed to archive document');
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const q = searchTerm.toLowerCase();
    return (
      doc.customerName.toLowerCase().includes(q) ||
      doc.customerPan.toLowerCase().includes(q) ||
      doc.fileName.toLowerCase().includes(q) ||
      doc.fiscalYear.toLowerCase().includes(q)
    );
  });

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Document Vault</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Centralized governance for customer compliance and tax infrastructure records</p>
        </div>

        <div className="hidden md:flex items-center gap-6">
           <div className="bg-white border border-slate-200 rounded-2xl px-8 py-4 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shadow-inner">
                 <Database size={18} />
              </div>
              <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Asset Inventory</p>
                 <p className="text-xl font-bold text-slate-900 leading-none tracking-tight">{documents.length} Records</p>
              </div>
           </div>
        </div>
      </div>

      {/* Status Notifications */}
      {(error || success) && (
        <div className={`p-5 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 shadow-sm ${
          error ? 'bg-red-50 border-red-100 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          {error ? <AlertCircle size={20} className="text-red-600" /> : <FileText size={20} className="text-slate-900" />}
          <p className="font-bold text-[11px] uppercase tracking-widest">{error || success}</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Upload Form */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-10">
             <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg">
                <Upload size={16} />
             </div>
             <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Institutional Ingestion</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Secure asset synchronization</p>
             </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Identity Node</label>
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <select
                     value={formData.customerId}
                     onChange={(e) => handleCustomerSelect(e.target.value)}
                     className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all cursor-pointer appearance-none shadow-sm"
                   >
                     <option value="">Query identity profile...</option>
                     {filteredCustomers.map((customer) => (
                       <option key={customer.id} value={customer.id}>
                         {customer.name} — {customer.pan}
                       </option>
                     ))}
                   </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Fiscal Indexing</label>
                <div className="relative">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <select
                     value={formData.fiscalYear}
                     onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
                     className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all cursor-pointer appearance-none shadow-sm"
                   >
                     {fiscalYears.map((year) => (
                       <option key={year} value={year}>{year}</option>
                     ))}
                   </select>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Operational Classification</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {['gst', 'itr', 'invoice', 'other'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-2 ${
                          formData.category === cat 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                        }`}
                      >
                        {cat}
                      </button>
                   ))}
                </div>
              </div>
            </div>

            {/* Dropzone */}
            <div className="relative group">
               <input
                 id="file-input"
                 type="file"
                 multiple
                 onChange={handleFileChange}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
               />
               <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-slate-50/30 group-hover:border-slate-900 group-hover:bg-slate-50 transition-all duration-500">
                  <div className="w-14 h-14 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                     <Upload size={24} />
                  </div>
                  <p className="text-slate-900 font-bold text-base tracking-tight mb-1">Queue assets for institutional synchronization</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Supports PDF • XLS • High-Resolution Media</p>
               </div>
            </div>

            {/* File List */}
            {formData.files.length > 0 && (
              <div className="space-y-6 pt-10 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between px-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Pending Queue Status</p>
                   <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{formData.files.length} Assets Registered</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.files.map((f, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col gap-4 group/file hover:border-slate-900 transition-all shadow-sm">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3 text-slate-900 overflow-hidden">
                            <FileText size={16} className="shrink-0 text-slate-300" />
                            <span className="text-[11px] font-bold truncate uppercase tracking-tight">{f.file.name}</span>
                         </div>
                         <button 
                           type="button" 
                           onClick={() => removeFile(idx)}
                           className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                      <input
                        type="text"
                        value={f.title}
                        onChange={(e) => updateFileTitle(idx, e.target.value)}
                        placeholder="Assign reference index..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-slate-900 transition-all placeholder:text-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !formData.customerId || formData.files.length === 0}
              className="w-full py-4.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              {uploading ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
              {uploading ? 'Processing Transactional Protocol...' : 'Initialize Secure Repository Synchronize'}
            </button>
          </form>
        </div>

        {/* Info/Filters */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm">
              <div className="mb-6">
                 <h3 className="text-base font-bold text-slate-900 tracking-tight">Repository Inquiry</h3>
                 <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-[0.2em]">Filter local assets</p>
              </div>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                 <input
                   type="text"
                   placeholder="Filter by node or index..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all shadow-sm placeholder:text-slate-300"
                 />
              </div>
           </div>

           <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-white/10 rounded-2xl border border-white/5 shadow-xl">
                    <Shield size={20} className="text-white" />
                 </div>
                 <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">Governance Layer</p>
                    <h4 className="text-base font-bold tracking-tight">Asset Integrity</h4>
                 </div>
              </div>
              <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                 Institutional assets are cryptographically protected at rest and accessible only via authorized administrative nodes. 
              </p>
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest border-t border-white/5 pt-6">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
                 Secure Stream v4.2
              </div>
           </div>
        </div>
      </div>

      {/* Ledger */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-1000">
         <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
               <h3 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Ledger</h3>
               <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-[0.2em]">Full document operational history</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
               <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse shadow-[0_0_8px_rgba(15,23,42,0.5)]" />
               <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Active Monitoring</p>
            </div>
         </div>

         {filteredDocuments.length > 0 ? (
           <div className="overflow-x-auto">
             <table className="w-full border-collapse">
               <thead>
                 <tr className="bg-white border-b border-slate-50">
                   <th className="px-10 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Entity Identity</th>
                   <th className="px-6 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Index Hash</th>
                   <th className="px-6 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fiscal Year</th>
                   <th className="px-6 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Asset Class</th>
                   <th className="px-6 py-6 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sync Date</th>
                   <th className="px-6 py-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                   <th className="px-10 py-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Governance</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filteredDocuments.map((doc) => (
                   <tr key={doc.id} className="hover:bg-slate-50/50 transition-all group">
                     <td className="px-10 py-6">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                           {doc.customerName.charAt(0)}
                         </div>
                         <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm tracking-tight">{doc.customerName}</span>
                            <span className="text-[10px] font-medium text-slate-400 truncate max-w-[140px]">{doc.fileName}</span>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-6">
                       <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">{doc.customerPan}</span>
                     </td>
                     <td className="px-6 py-6">
                       <span className="text-[11px] font-bold text-slate-900 tracking-tight">{doc.fiscalYear}</span>
                     </td>
                     <td className="px-6 py-6">
                       <span className="text-[9px] font-bold text-slate-900 uppercase bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                         {doc.category}
                       </span>
                     </td>
                     <td className="px-6 py-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                           {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                     </td>
                     <td className="px-6 py-6 text-center">
                       <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 w-fit mx-auto">
                          <span className={`w-1.5 h-1.5 rounded-full ${doc.status === 'active' ? 'bg-slate-900' : 'bg-slate-200'}`} />
                          <span className="text-[9px] font-bold text-slate-900 uppercase tracking-widest">
                            {doc.status}
                          </span>
                       </div>
                     </td>
                     <td className="px-10 py-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         {doc.status === 'active' && (
                           <button
                             onClick={() => handleArchive(doc.id)}
                             className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-900 hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95"
                           >
                             Archive Node
                           </button>
                         )}
                         <button
                           onClick={() => handleDelete(doc.id)}
                           className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                           title="Purge Physical Record"
                         >
                           <Trash2 size={18} />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ) : (
           <div className="text-center py-32 bg-slate-50/20">
             <div className="w-20 h-20 bg-white border border-slate-100 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Database size={24} />
             </div>
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Ledger Vacuum Detected</h3>
             <p className="text-xs text-slate-500 mt-2 font-medium">Platform ready for high-volume asset ingestion</p>
           </div>
         )}
      </div>

      <div className="mt-16 text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">Institutional Repository • Protocol v4.22-STABLE</p>
      </div>
    </div>
  );
}
