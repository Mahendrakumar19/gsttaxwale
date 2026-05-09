'use client';

import { useState } from 'react';
import { Check, X, Eye, Filter } from 'lucide-react';

export default function DocumentsVerification() {
  const [documents, setDocuments] = useState([
    { id: 1, userName: 'John Doe', type: 'PAN Card', status: 'pending', uploadedAt: '2024-05-01' },
    { id: 2, userName: 'Jane Smith', type: 'Aadhaar', status: 'verified', uploadedAt: '2024-04-28' },
    { id: 3, userName: 'Bob Wilson', type: 'Bank Statement', status: 'rejected', uploadedAt: '2024-04-25' },
    { id: 4, userName: 'Alice Brown', type: 'Form 16', status: 'pending', uploadedAt: '2024-05-02' },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredDocs = documents.filter(
    (doc) => filterStatus === 'all' || doc.status === filterStatus
  );

  const handleVerify = (id: number) => {
    setDocuments(documents.map((doc) => (doc.id === id ? { ...doc, status: 'verified' } : doc)));
  };

  const handleReject = (id: number) => {
    setDocuments(documents.map((doc) => (doc.id === id ? { ...doc, status: 'rejected' } : doc)));
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
      verified: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: '✕' },
    };
    const c = config[status] || config.pending;
    return <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{c.icon} {status.toUpperCase()}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Filter & Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">Showing {filteredDocs.length} documents</p>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Document Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Uploaded</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{doc.userName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{doc.type}</td>
                <td className="px-6 py-4 text-sm">{getStatusBadge(doc.status)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{doc.uploadedAt}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                      <Eye size={18} />
                    </button>
                    {doc.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleVerify(doc.id)}
                          className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:bg-green-100 rounded-lg transition"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(doc.id)}
                          className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-100 rounded-lg transition"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{documents.filter((d) => d.status === 'pending').length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Verified</p>
          <p className="text-2xl font-bold text-green-600">{documents.filter((d) => d.status === 'verified').length}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{documents.filter((d) => d.status === 'rejected').length}</p>
        </div>
      </div>
    </div>
  );
}
