'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Calendar, Download } from 'lucide-react';
import api from '@/lib/api';

interface Filing {
  id: string;
  type: string;
  period: string;
  status: 'pending' | 'filed' | 'approved';
  deadline: string;
  submittedOn?: string;
}

interface Deadline {
  type: string;
  dueDate: string;
  daysRemaining: number;
  priority: 'high' | 'medium' | 'low';
}

type FilingType = 'all' | 'gst' | 'itr' | 'other';

export default function FilingsTab() {
  const [filings, setFilings] = useState<Filing[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<FilingType>('all');

  useEffect(() => {
    fetchFilings();
  }, []);

  const fetchFilings = async () => {
    try {
      const response = await api.get('/api/dashboard/filings');
      if (response.data?.filings) {
        setFilings(response.data.filings);
      }
    } catch (error) {
      console.error('Failed to fetch filings:', error);
      // Mock data for demo
      setFilings([
        {
          id: '1',
          type: 'GST',
          period: 'January 2026',
          status: 'filed',
          deadline: '2026-01-31',
          submittedOn: '2026-01-28',
        },
        {
          id: '2',
          type: 'GST',
          period: 'February 2026',
          status: 'filed',
          deadline: '2026-02-28',
          submittedOn: '2026-02-26',
        },
        {
          id: '3',
          type: 'GST',
          period: 'March 2026',
          status: 'pending',
          deadline: '2026-03-31',
        },
        {
          id: '4',
          type: 'GST',
          period: 'Q1 2026',
          status: 'pending',
          deadline: '2026-04-15',
        },
        {
          id: '5',
          type: 'ITR',
          period: 'FY 2024-25',
          status: 'filed',
          deadline: '2026-07-31',
          submittedOn: '2026-01-10',
        },
        {
          id: '6',
          type: 'ITR',
          period: 'FY 2025-26',
          status: 'pending',
          deadline: '2026-07-31',
        },
      ]);
      setDeadlines([
        { type: 'GST - March', dueDate: '2026-03-31', daysRemaining: 74, priority: 'high' },
        { type: 'ITR - Annual', dueDate: '2026-07-31', daysRemaining: 167, priority: 'medium' },
        { type: 'GST Q1', dueDate: '2026-04-15', daysRemaining: 89, priority: 'medium' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Loading filings...</p>
      </div>
    );
  }

  // Filter filings by type
  const filteredFilings = filings.filter((f) => {
    if (activeType === 'all') return true;
    if (activeType === 'gst') return f.type.toUpperCase().includes('GST');
    if (activeType === 'itr') return f.type.toUpperCase().includes('ITR');
    return !f.type.toUpperCase().includes('GST') && !f.type.toUpperCase().includes('ITR');
  });

  // Group filings by month/quarter
  const groupedFilings = groupFilingsByPeriod(filteredFilings);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Filing Status</h2>
        <p className="text-gray-600 mb-6">Track your tax filings and upcoming deadlines</p>
      </div>

      {/* Filing Type Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {(['all', 'gst', 'itr', 'other'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-t-lg transition capitalize font-medium ${
              activeType === type
                ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {type === 'all' ? 'All Filings' : type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-bold text-gray-900">📅 Upcoming Deadlines</h3>
        </div>
        <div className="space-y-3">
          {deadlines.length > 0 ? (
            deadlines.map((deadline, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100"
              >
                <div>
                  <p className="font-semibold text-gray-900">{deadline.type}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(deadline.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    deadline.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : deadline.priority === 'medium'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {deadline.daysRemaining} days
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-600">
              No upcoming deadlines
            </div>
          )}
        </div>
      </div>

      {/* Grouped Filings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filing Records</h3>
        {Object.keys(groupedFilings).length > 0 ? (
          Object.entries(groupedFilings).map(([period, filingList]) => (
            <div key={period} className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                {period}
              </h4>
              <div className="space-y-3">
                {filingList.map((filing) => (
                  <FilingCard key={filing.id} filing={filing} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">No filings found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function groupFilingsByPeriod(filings: Filing[]) {
  const grouped: Record<string, Filing[]> = {};

  filings.forEach((filing) => {
    const key = filing.period; // Groups by month/quarter like "January 2026", "Q1 2026"
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(filing);
  });

  return grouped;
}

function FilingCard({ filing }: { filing: Filing }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filed':
        return <CheckCircle className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed':
        return 'from-yellow-50 to-amber-50 border-yellow-200';
      case 'approved':
        return 'from-green-50 to-emerald-50 border-green-200';
      default:
        return 'from-orange-50 to-amber-50 border-orange-200';
    }
  };

  const handleDownload = () => {
    // TODO: Implement actual download
    console.log(`Downloading filing: ${filing.id}`);
  };

  return (
    <div
      className={`bg-gradient-to-br ${getStatusColor(
        filing.status
      )} border rounded-lg p-4`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {getStatusIcon(filing.status)}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">
              {filing.type} Filing - {filing.period}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Status: <span className="capitalize font-medium">{filing.status}</span>
            </p>
            {filing.submittedOn && (
              <p className="text-xs text-gray-500 mt-1">
                Submitted: {new Date(filing.submittedOn).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-sm text-gray-600">Deadline</p>
            <p className="font-semibold text-gray-900">
              {new Date(filing.deadline).toLocaleDateString()}
            </p>
          </div>
          {filing.status === 'filed' || filing.status === 'approved' ? (
            <button
              onClick={handleDownload}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              title="Download filing"
            >
              <Download className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
