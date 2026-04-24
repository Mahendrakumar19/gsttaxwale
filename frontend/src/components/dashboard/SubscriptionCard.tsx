'use client';

import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface SubscriptionCardProps {
  isSubscribed: boolean;
  planName?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
}

export default function SubscriptionCard({
  isSubscribed,
  planName = 'GST Pro',
  validFrom,
  validTo,
  daysRemaining = 0,
}: SubscriptionCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            {isSubscribed ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-orange-600" />
            )}
            <h3 className="text-xl font-bold text-gray-900">
              {isSubscribed ? 'Subscription Active' : 'No Active Subscription'}
            </h3>
          </div>

          {isSubscribed ? (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-blue-900">{planName}</p>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="w-4 h-4" />
                <span>
                  {validFrom &&
                    `Valid until ${new Date(validTo || '').toLocaleDateString()}`}
                </span>
              </div>
              {daysRemaining > 0 && (
                <p className="text-sm text-green-700 font-medium">
                  {daysRemaining} days remaining
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-700">
              Subscribe to unlock all premium features and priority support
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
