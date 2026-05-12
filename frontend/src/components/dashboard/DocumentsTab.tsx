'use client';

import { useState, useEffect } from 'react';
import { Download, Eye, FileText, Calendar, Info, ChevronDown } from 'lucide-react';
import api from '@/lib/api';

interface Document {
  id: string;
  name: string;
  category: 'GST' | 'ITR' | 'Others';
  financialYear: string;
  size: number;
  uploadedOn: string;
  fileType: string;
  url: string;
}

export default function DocumentsTab() {
  const [groupedDocuments, setGroupedDocuments] = useState<any>({ ITR: [], GST: [], OTHER: [] });
  const [loading, setLoading] = useState(true);
  const [selectedFY, setSelectedFY] = useState('2025-26');
  const [activeTab, setActiveTab] = useState('ITR');

  const financialYears = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22', '2020-21', '2019-20', '2018-19'];

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/documents?fy=${selectedFY}`);
      if (response.data?.success && response.data?.data) {
        setGroupedDocuments(response.data.data);
      } else {
        // Fallback mock data matching the design if API empty
        setGroupedDocuments({
          ITR: [
            { id: '1', originalName: 'ITR_Acknowledgement.pdf', uploadedAt: '2025-08-12', fileUrl: '#' },
            { id: '2', originalName: 'Form16.pdf', uploadedAt: '2025-08-10', fileUrl: '#' },
            { id: '3', originalName: 'Tax_Computation_2025.pdf', uploadedAt: '2025-08-08', fileUrl: '#' },
          ],
          GST: [
            { id: '4', originalName: 'GST_Return_Aug2025.pdf', uploadedAt: '2025-08-15', fileUrl: '#' },
            { id: '5', originalName: 'GSTR9_2025.pdf', uploadedAt: '2025-08-14', fileUrl: '#' },
            { id: '6', originalName: 'GSTR1_July2025.pdf', uploadedAt: '2025-08-12', fileUrl: '#' },
          ],
          OTHER: [
            { id: '7', originalName: 'PAN_Copy.pdf', uploadedAt: '2025-08-17', fileUrl: '#' },
            { id: '8', originalName: 'Aadhaar_Copy.pdf', uploadedAt: '2025-08-17', fileUrl: '#' },
            { id: '9', originalName: 'Bank_Statement.pdf', uploadedAt: '2025-08-16', fileUrl: '#' },
          ]
        });
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedFY]);

  const categories = [
    { id: 'ITR', label: 'ITR', color: 'text-blue-600', iconColor: 'bg-blue-50' },
    { id: 'GST', label: 'GST', color: 'text-green-600', iconColor: 'bg-green-50' },
    { id: 'OTHER', label: 'Others', color: 'text-purple-600', iconColor: 'bg-purple-50' },
  ];

  const DocumentRow = ({ doc }: { doc: any }) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : '';
    const fileUrlWithToken = doc.fileUrl ? `${doc.fileUrl}${doc.fileUrl.includes('?') ? '&' : '?'}token=${token}` : '#';

    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shadow-sm border border-red-100">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
               <polyline points="14 2 14 8 20 8"></polyline>
               <line x1="9" y1="15" x2="12" y2="15"></line>
               <line x1="9" y1="11" x2="15" y2="11"></line>
               <line x1="9" y1="19" x2="15" y2="19"></line>
             </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 leading-tight">{doc.originalName || doc.filename}</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Uploaded: {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.open(fileUrlWithToken, '_blank')}
            className="flex items-center gap-2 px-3 py-1.5 text-blue-600 border border-blue-200 rounded-lg text-[11px] font-bold hover:bg-blue-50 transition"
          >
            <Eye size={14} />
            View
          </button>
          <a 
            href={fileUrlWithToken} 
            download 
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition shadow-sm"
          >
            <Download size={14} />
            Download
          </a>
        </div>
      </div>
    );
  };


  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header & FY Selector */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Documents</h1>
          <p className="text-slate-500 text-sm mt-1">View and download your important documents</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial Year</span>
          <div className="relative group">
            <select 
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              {financialYears.map(fy => <option key={fy} value={fy}>{fy}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-100 mb-8 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-8 py-4 text-sm font-black transition-all relative whitespace-nowrap ${
              activeTab === cat.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {cat.label}
            {activeTab === cat.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Document Sections */}
      <div className="space-y-8">
        {categories.filter(c => activeTab === 'All' || activeTab === c.id || true).map((cat) => {
          const docs = groupedDocuments[cat.id] || [];
          if (activeTab !== 'All' && activeTab !== cat.id) return null;
          
          return (
            <div key={cat.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
                  <div className={`w-8 h-8 ${cat.iconColor} ${cat.color} rounded-lg flex items-center justify-center`}>
                    <FileText size={18} />
                  </div>
                  <h3 className={`text-sm font-black uppercase tracking-widest ${cat.color}`}>{cat.label} Documents</h3>
               </div>
               
               <div className="divide-y divide-slate-50">
                  {docs.length > 0 ? (
                    docs.map((doc: any) => <DocumentRow key={doc.id} doc={doc} />)
                  ) : (
                    <div className="p-12 text-center text-slate-400">
                      <p className="text-sm font-medium">No {cat.label} documents available for {selectedFY}</p>
                    </div>
                  )}
               </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-12 flex items-center gap-3 text-slate-400">
        <Info size={16} />
        <p className="text-xs font-medium">If you can't find a document, please contact our support team.</p>
      </div>
    </div>
  );
}
