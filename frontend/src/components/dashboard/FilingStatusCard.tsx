'use client';

import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export default function FilingStatusCard() {
  const [filings, setFilings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFilingStatus();
  }, []);

  const fetchFilingStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/user/filing-status');
      setFilings(response.data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load filing status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'draft':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed':
        return 'bg-green-50 border-green-200';
      case 'draft':
        return 'bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

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
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        Filing Status
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {filings.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No filings yet</p>
      ) : (
        <div className="space-y-3">
          {filings.map((filing) => (
            <div key={filing.id} className={`p-4 border rounded-lg ${getStatusColor(filing.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(filing.status)}
                  <div>
                    <p className="font-medium text-gray-900">{filing.itrType || 'ITR'} - AY {filing.assessmentYear}</p>
                    <p className="text-sm text-gray-600">Financial Year: {filing.filingYear}</p>
                  </div>
                </div>
                <span className="text-sm font-medium capitalize text-gray-700">{filing.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
