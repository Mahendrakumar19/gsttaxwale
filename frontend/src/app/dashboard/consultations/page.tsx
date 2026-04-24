"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Download, FileText, Calendar, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

export default function ConsultationsPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!authToken || !userData) {
      router.push('/auth/login');
      return;
    }

    setToken(authToken);
    loadConsultations(authToken);
  }, [router]);

  async function loadConsultations(authToken: string) {
    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/consultations`,
        config
      );
      setConsultations(res.data.data?.consultations || []);
    } catch (err) {
      console.error('Failed to load consultations', err);
    } finally {
      setLoading(false);
    }
  }

  async function downloadDocument(consultationId: string, documentName: string) {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/consultations/${consultationId}/document`,
        config
      );
      
      const documentUrl = res.data.data?.documentUrl;
      if (documentUrl) {
        // Open in new tab or download
        window.open(documentUrl, '_blank');
      }
    } catch (err) {
      console.error('Failed to download document', err);
      alert('Failed to download document');
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultation Details</h1>
            <p className="text-gray-600 mt-1">Access consultation reports and documents</p>
          </div>
        </div>

        {/* Consultations Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading consultations...</div>
        ) : consultations.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-12 text-center">
            <FileText className="mx-auto text-slate-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-white mb-2">No Consultations Yet</h2>
            <p className="text-slate-400 mb-6">Once your consultation is completed, documents will appear here for download.</p>
            <Link href="/dashboard" className="inline-block text-amber-400 hover:text-amber-300 transition">
              Return to Dashboard →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {consultations.map((consultation: any) => (
              <div
                key={consultation.id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600/30 rounded-xl p-6 hover:border-slate-600/50 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{consultation.subject}</h3>
                    <p className="text-gray-600 text-sm mb-3">{consultation.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                    consultation.status === 'completed'
                      ? 'bg-green-900/30 text-green-400'
                      : consultation.status === 'in-progress'
                      ? 'bg-blue-900/30 text-blue-400'
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {consultation.status}
                  </span>
                </div>

                <div className="space-y-2 mb-6 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-500" />
                    Type: <span className="capitalize">{consultation.consultationType}</span>
                  </div>
                  {consultation.scheduledDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      Scheduled: {new Date(consultation.scheduledDate).toLocaleDateString()}
                    </div>
                  )}
                  {consultation.completedAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      Completed: {new Date(consultation.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Document Section */}
                {consultation.status === 'completed' && consultation.documentUrl ? (
                  <button
                    onClick={() => downloadDocument(consultation.id, consultation.documentName || 'Consultation Report')}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold py-3 rounded-lg hover:from-amber-500 hover:to-amber-400 transition"
                  >
                    <Download size={20} />
                    Download {consultation.documentName ? `(${consultation.documentName})` : 'Document'}
                  </button>
                ) : consultation.status === 'completed' ? (
                  <div className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700/30 text-center">
                    <p className="text-gray-600 text-sm">Document will be available soon</p>
                  </div>
                ) : (
                  <div className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700/30 text-center">
                    <p className="text-gray-600 text-sm">Consultation in progress...</p>
                  </div>
                )}

                {/* Admin Info */}
                {consultation.admin && (
                  <div className="mt-4 pt-4 border-t border-slate-700/30">
                    <p className="text-xs text-slate-400 mb-2">Assigned to:</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-semibold">
                        {consultation.admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-gray-900 text-sm font-semibold">{consultation.admin.name}</p>
                        <p className="text-gray-600 text-xs">{consultation.admin.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-900/10 border border-blue-500/30 rounded-xl p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">About Consultations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-gray-900 font-semibold mb-2">Tax Planning</h4>
              <p className="text-gray-700 text-sm">Personalized strategies to minimize your tax liabilities while staying compliant with all regulations.</p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-2">Compliance Review</h4>
              <p className="text-gray-700 text-sm">Comprehensive review of your financial records and tax filings to ensure full compliance.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Audit Support</h4>
              <p className="text-gray-700 text-sm">Expert guidance and support throughout the audit process with detailed documentation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
