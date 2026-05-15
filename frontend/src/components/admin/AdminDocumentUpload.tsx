'use client';

import { useState, useEffect } from 'react';
import { Upload, Trash2, FileText, Search, Download, Calendar, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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


  // Fetch customers on component mount
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

      // Refresh documents list
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
      // Use loose inequality or convert to string to ensure matching works regardless of type
      setDocuments(documents.filter((doc) => String(doc.id) !== String(docId)));
      setSuccess('Document deleted successfully');
      // Also refresh just in case
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Management</h2>
        <p className="text-gray-600">Upload and manage tax documents for customers</p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {success}
        </div>
      )}

      {/* Upload Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Upload New Document</h3>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Customer Selection - By Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Customer by Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <select
                  value={formData.customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">-- Select Customer --</option>
                  {filteredCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.pan})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Selection - By PAN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Select by PAN Number
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">-- Select by PAN --</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.pan} - {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fiscal Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiscal Year
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                <select
                  value={formData.fiscalYear}
                  onChange={(e) =>
                    setFormData({ ...formData, fiscalYear: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 bg-white"
                >
                  {fiscalYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Document Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="gst">GST Return</option>
                <option value="itr">Income Tax Return</option>
                <option value="form16">Form 16</option>
                <option value="invoice">Invoice</option>
                <option value="gstr1">GSTR-1</option>
                <option value="gstr2">GSTR-2</option>
                <option value="gstr3b">GSTR-3B</option>
                <option value="bank_statement">Bank Statement</option>
                <option value="aadhaar">Aadhaar</option>
                <option value="pan">PAN Card</option>
                <option value="other">Other</option>
              </select>
            </div>

          {/* File Upload List */}
          {formData.files.length > 0 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Documents to Upload</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.files.map((f, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative group">
                    <button 
                      type="button" 
                      onClick={() => removeFile(idx)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} className="text-gray-400" />
                      <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{f.file.name}</span>
                    </div>
                    <input
                      type="text"
                      value={f.title}
                      onChange={(e) => updateFileTitle(idx, e.target.value)}
                      placeholder="Display Title"
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:border-blue-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Dropzone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files to Upload (Multiple Supported)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition group cursor-pointer relative">
              <input
                id="file-input"
                type="file"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <Upload className="mx-auto text-gray-400 group-hover:text-blue-500 mb-2 transition" size={32} />
              <p className="text-gray-600">
                <span className="text-blue-600 font-semibold">Click to upload</span>
                <span className="text-gray-600"> or drag and drop</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Select multiple files at once</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !formData.customerId || formData.files.length === 0}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? 'Uploading...' : `Upload ${formData.files.length} Document${formData.files.length !== 1 ? 's' : ''}`}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by customer name, PAN, filename, or fiscal year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {filteredDocuments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">PAN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fiscal Year</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">File Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Uploaded</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText size={14} className="text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{doc.customerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-mono text-gray-700">{doc.customerPan}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{doc.fiscalYear}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                        {doc.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{doc.fileName}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          doc.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {doc.status === 'active' ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {doc.status === 'active' ? (
                          <button
                            onClick={() => handleArchive(doc.id)}
                            className="px-3 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition"
                          >
                            Archive
                          </button>
                        ) : (
                          <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded">Archived</span>
                        )}
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600">No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
