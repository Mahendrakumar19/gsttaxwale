'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import api from '@/lib/api';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedOn: string;
  fileType: string;
}

export default function DocumentsTab() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/api/dashboard/documents');
      if (response.data?.documents) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      // Mock data
      setDocuments([
        { id: '1', name: 'GST Registration Certificate', type: 'Certificate', size: 1024 * 1024 * 1.2, uploadedOn: '2026-04-10', fileType: 'pdf' },
        { id: '2', name: 'GSTR-3B Acknowledgement - March', type: 'Receipt', size: 1024 * 512, uploadedOn: '2026-04-20', fileType: 'pdf' },
        { id: '3', name: 'PAN Card Copy', type: 'KYC', size: 1024 * 256, uploadedOn: '2026-01-15', fileType: 'jpg' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase()) || 
    doc.type.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-12 text-gray-500">Loading documents...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Documents</h2>
          <p className="text-sm text-gray-500">View and download documents sent by admin</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filteredDocs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{doc.name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded uppercase">{doc.fileType}</span>
                      <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{new Date(doc.uploadedOn).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                
                <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition text-xs font-bold">
                  <Download size={14} />
                  Download
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p>No documents found</p>
          </div>
        )}
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <span className="text-lg">ℹ️</span>
        <p className="text-xs text-amber-800 leading-relaxed">
          Only documents uploaded and verified by the admin team will appear here. 
          If you are missing a document, please contact your account manager.
        </p>
      </div>
    </div>
  );
}
