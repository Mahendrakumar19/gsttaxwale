'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, Clock } from 'lucide-react';
import type { DueDate } from '@/types/api';

interface DueDatesProps {
  limit?: number;
  filingType?: string;
}

const getStatusColor = (status: string, daysUntil: number) => {
  if (status === 'overdue') return 'bg-red-50 border-red-300';
  if (status === 'due-soon' || daysUntil <= 7) return 'bg-orange-50 border-orange-300';
  return 'bg-blue-50 border-blue-300';
};

const getStatusBadgeColor = (status: string, daysUntil: number) => {
  if (status === 'overdue') return 'bg-red-100 text-red-700';
  if (status === 'due-soon' || daysUntil <= 7) return 'bg-orange-100 text-orange-700';
  return 'bg-blue-100 text-blue-700';
};

const getStatusIcon = (status: string, daysUntil: number) => {
  if (status === 'overdue') return <AlertTriangle className="w-5 h-5 text-red-600" />;
  if (status === 'due-soon' || daysUntil <= 7) return <AlertTriangle className="w-5 h-5 text-orange-600" />;
  return <Calendar className="w-5 h-5 text-blue-600" />;
};

const getStatusText = (status: string, daysUntil: number) => {
  if (status === 'overdue') return 'OVERDUE';
  if (daysUntil < 0) return `${Math.abs(daysUntil)} DAYS OVERDUE`;
  if (daysUntil === 0) return 'DUE TODAY';
  if (daysUntil === 1) return 'DUE TOMORROW';
  if (daysUntil <= 7) return `${daysUntil} DAYS LEFT`;
  return `${daysUntil} DAYS LEFT`;
};

export default function DueDatesSection({ limit = 6, filingType }: DueDatesProps) {
  const [dueDates, setDueDates] = useState<DueDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDueDates = async () => {
      try {
        setLoading(true);
        const url = new URL('/api/due-dates', window.location.origin);
        url.searchParams.append('limit', limit.toString());
        if (filingType) url.searchParams.append('filingType', filingType);

        const res = await fetch(url.toString());
        const data = await res.json();

        if (data.success) {
          setDueDates(data.data.dueDates);
        } else {
          setError('Failed to load due dates');
        }
      } catch (err) {
        console.error('Error fetching due dates:', err);
        setError('Error loading due dates');
      } finally {
        setLoading(false);
      }
    };

    fetchDueDates();
  }, [limit, filingType]);

  const calculateDaysUntil = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {dueDates.map((item) => {
        const daysUntil = calculateDaysUntil(item.dueDate);
        const statusText = getStatusText(item.status, daysUntil);

        return (
          <div
            key={item.id}
            className={`border-2 rounded-lg p-4 transition-all hover:shadow-lg ${getStatusColor(item.status, daysUntil)}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2">
                {getStatusIcon(item.status, daysUntil)}
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-700 mt-1">{item.filingType}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">{item.description}</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(item.dueDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {item.frequency && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">{item.frequency}</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
              <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusBadgeColor(item.status, daysUntil)}`}>
                {statusText}
              </span>
            </div>
          </div>
        );
      })}

      {dueDates.length === 0 && (
        <div className="col-span-full text-center py-6 text-gray-600">
          <p>No upcoming due dates at this time.</p>
        </div>
      )}
    </div>
  );
}
