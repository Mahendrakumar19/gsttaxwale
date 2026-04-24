'use client';

import { useState } from 'react';
import { Upload, Trash2, FileText } from 'lucide-react';

interface DocumentUpload {
  id: string;
  fileName: string;
  userId: string;
  year: number;
  category: string;
  status: 'active' | 'archived';
  uploadedAt: string;
}

export default function AdminDocumentUpload() {
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    {
      id: '1',
      fileName: 'GST Return 2026.pdf',
      userId: 'user123',
      year: 2026,
      category: 'gst',
      status: 'active',
      uploadedAt: '2026-01-15',
    },
    {
      id: '2',
      fileName: 'ITR FY25.pdf',
      userId: 'user456',
      year: 2025,
      category: 'itr',
      status: 'active',
      uploadedAt: '2026-01-10',
    },
  ]);

  const [formData, setFormData] = useState({
    userId: '',
    year: new Date().getFullYear(),
    category: 'gst',
    fileName: '',
  });

  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // TODO: Implement actual file upload to API
      const newDoc: DocumentUpload = {
        id: `doc_${Date.now()}`,
        fileName: formData.fileName,
        userId: formData.userId,
        year: formData.year,
        category: formData.category,
        status: 'active',
        uploadedAt: new Date().toISOString().split('T')[0],
      };

      setDocuments([newDoc, ...documents]);
      setFormData({
        userId: '',
        year: new Date().getFullYear(),
        category: 'gst',
        fileName: '',
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const handleArchive = (id: string) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === id ? { ...doc, status: 'archived' } : doc
      )
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Management</h2>
        <p className="text-gray-600">Upload and manage documents for users</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Upload Document</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                placeholder="Enter user ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
              >
                <option value="gst">GST</option>
                <option value="itr">ITR</option>
                <option value="pan">PAN</option>
                <option value="aadhaar">Aadhaar</option>
                <option value="form16">Form 16</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Name
              </label>
              <input
                type="text"
                value={formData.fileName}
                onChange={(e) =>
                  setFormData({ ...formData, fileName: e.target.value })
                }
                placeholder="e.g., GST Return 2026.pdf"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Uploaded Documents</h3>
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition ${
                  doc.status === 'archived'
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{doc.fileName}</h4>
                    <p className="text-sm text-gray-600">
                      User: {doc.userId} • {doc.year} •{' '}
                      <span className="capitalize">{doc.category}</span> •{' '}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doc.status === 'active' ? (
                    <button
                      onClick={() => handleArchive(doc.id)}
                      className="px-4 py-2 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition"
                    >
                      Archive
                    </button>
                  ) : (
                    <span className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg">
                      Archived
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
