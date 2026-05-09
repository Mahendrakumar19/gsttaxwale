'use client';

import { useEffect, useState } from 'react';
import { Package, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

export default function ServicesCard() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/user/services');
      setServices(response.data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: any = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      expired: { bg: 'bg-red-100', text: 'text-red-800', icon: Clock },
    };

    const config = configs[status] || configs.inactive;
    const IconComponent = config.icon;

    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <IconComponent size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-100 rounded"></div>
          <div className="h-12 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-600" />
        Filing Services
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Core Services Section */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs font-bold text-blue-700 uppercase mb-1">GST Compliance</p>
            <p className="text-sm text-gray-900 font-medium">GSTR-9, 9C</p>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
            <p className="text-xs font-bold text-purple-700 uppercase mb-1">ITR Filing</p>
            <p className="text-sm text-gray-900 font-medium">One-time Filing</p>
          </div>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-4 border-t border-gray-100 mt-4">
            <p className="text-gray-500 text-sm mb-3">No active service subscriptions</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              <TrendingUp size={16} />
              Activate Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{service.service_name}</p>
                    <p className="text-sm text-gray-600">{service.service_type}</p>
                  </div>
                  {getStatusBadge(service.status || 'active')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
