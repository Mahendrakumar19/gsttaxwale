'use client';

import { useEffect, useState } from 'react';
import { Activity, CheckCircle, FileUp, User, Clock } from 'lucide-react';
import api from '@/lib/api';

export default function ActivityTimeline() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivityLog();
  }, []);

  const fetchActivityLog = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard/user/activity');
      setActivities(response.data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('Document'))
      return <FileUp className="w-5 h-5 text-blue-600" />;
    if (action.includes('Payment'))
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (action.includes('Profile'))
      return <User className="w-5 h-5 text-purple-600" />;
    return <Activity className="w-5 h-5 text-gray-600" />;
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
        <Activity className="w-5 h-5 text-blue-600" />
        Recent Activity
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {activities.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No activities yet</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id || index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                  {getActivityIcon(activity.action)}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.created_at || activity.createdAt).toLocaleDateString()} at{' '}
                  {new Date(activity.created_at || activity.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <button className="w-full mt-4 px-4 py-2 text-center text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm">
          View All Activity
        </button>
      )}
    </div>
  );
}
