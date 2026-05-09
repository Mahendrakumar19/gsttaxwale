'use client';

import { useEffect, useState } from 'react';
import { FileUp, Trash2, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '@/lib/api';

export default function DocumentsCenter() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('ITR');
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const filteredDocs = documents.filter(doc => {
    if (activeTab === 'ITR') return ['ITR', 'FORM16', 'INVESTMENT_PROOF'].includes(doc.type?.toUpperCase());
    if (activeTab === 'GST') return doc.type?.toUpperCase().includes('GST');
    return !['ITR', 'FORM16', 'INVESTMENT_PROOF'].includes(doc.type?.toUpperCase()) && !doc.type?.toUpperCase().includes('GST');
  });

  useEffect(() => {
    fetchDocuments();
  }, [selectedYear]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/user/documents', {
        params: { financialYear: selectedYear },
      });
      setDocuments(response.data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/api/dashboard/user/documents/${docId}`);
      setDocuments(documents.filter((d) => d.id !== docId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const documentTypes = [
    { value: 'PAN', label: 'PAN Card' },
    { value: 'AADHAAR', label: 'Aadhaar Card' },
    { value: 'BANK_STATEMENT', label: 'Bank Statement' },
    { value: 'FORM16', label: 'Form 16' },
    { value: 'INVESTMENT_PROOF', label: 'Investment Proof' },
    { value: 'ITR', label: 'Previous ITR' },
  ];

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileUp className="w-5 h-5 text-blue-600" />
          Documents Center
        </h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {[2023, 2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>
              FY {year}-{year + 1}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {['ITR', 'GST', 'Others'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Document Upload based on Tab */}
      <div className="mb-6 p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-blue-300 transition group">
        <div className="text-center">
          <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-blue-500 transition" />
          <p className="text-sm font-medium text-gray-900 mb-1">Upload {activeTab} Documents</p>
          <p className="text-xs text-gray-500 mb-4">Supported: PDF, JPG, PNG (Max 5MB)</p>
          
          <div className="flex flex-wrap justify-center gap-2">
            {activeTab === 'ITR' && (
              <>
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:border-blue-500 hover:text-blue-600 transition">Form 16</button>
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:border-blue-500 hover:text-blue-600 transition">Investment Proofs</button>
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:border-blue-500 hover:text-blue-600 transition">Rental Agreements</button>
              </>
            )}
            {activeTab === 'GST' && (
              <>
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:border-blue-500 hover:text-blue-600 transition">GST Certificate</button>
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:border-blue-500 hover:text-blue-600 transition">Invoices</button>
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:border-blue-500 hover:text-blue-600 transition">Bank Statements</button>
              </>
            )}
            {activeTab === 'Others' && (
              <>
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:border-blue-500 hover:text-blue-600 transition">PAN Card</button>
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:border-blue-500 hover:text-blue-600 transition">Aadhaar Card</button>
                <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:border-blue-500 hover:text-blue-600 transition">Other Certificates</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Document List (Filtered) */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-500 text-sm">No {activeTab} documents found for FY {selectedYear}-{selectedYear+1}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition group">
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(doc.status)}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{doc.fileName || doc.type}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded on {new Date(doc.createdAt || doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition">
                <button className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600" title="Download">
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
