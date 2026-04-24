'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import SubscriptionCard from './SubscriptionCard';

interface FilingStats {
  totalIncome: number;
  totalDeductions: number;
  taxAmount: number;
  refund: number;
}

interface SubscriptionPlan {
  name: string;
  validFrom: string;
  validTo: string;
  status: 'active' | 'expired';
  features: string[];
}

export default function OverviewTab() {
  const [stats, setStats] = useState<FilingStats>({
    totalIncome: 0,
    totalDeductions: 0,
    taxAmount: 0,
    refund: 0,
  });
  const [plan, setPlan] = useState<SubscriptionPlan>({
    name: 'GST Pro',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    status: 'active',
    features: ['Auto GST Filing', 'Quarterly Returns', 'Priority Support'],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/dashboard/overview');
      if (response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <SubscriptionCard
        isSubscribed={plan.status === 'active'}
        planName={plan.name}
        validFrom={plan.validFrom}
        validTo={plan.validTo}
      />

      {/* Filing Status Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filing Status</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FilingStatusCard
            type="GST"
            status="filed"
            lastFiled="2026-01-25"
            nextDue="2026-02-28"
          />
          <FilingStatusCard
            type="ITR"
            status="pending"
            lastFiled={null}
            nextDue="2026-07-31"
          />
        </div>
      </div>


    </div>
  );
}



function FilingStatusCard({
  type,
  status,
  lastFiled,
  nextDue,
}: {
  type: string;
  status: 'pending' | 'filed' | 'approved';
  lastFiled: string | null;
  nextDue: string;
}) {
  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'filed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
    }
  };

  const getColor = (s: string) => {
    switch (s) {
      case 'filed':
      case 'approved':
        return 'border-green-200';
      default:
        return 'border-orange-200';
    }
  };

  return (
    <div className={`bg-white border rounded-lg p-5 ${getColor(status)}`}>
      <div className="flex items-center gap-2 mb-3">
        {getStatusIcon(status)}
        <h4 className="font-semibold text-gray-900">{type}</h4>
      </div>
      <div className="space-y-2 text-sm">
        {lastFiled && (
          <div>
            <p className="text-xs text-gray-600">Last Filed:</p>
            <p className="text-gray-900 font-medium">{new Date(lastFiled).toLocaleDateString()}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-600">Next Due:</p>
          <p className="text-gray-900 font-medium">{new Date(nextDue).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
