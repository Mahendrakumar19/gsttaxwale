'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReturnSummary from '@/components/ReturnSummary';

export default function ReturnsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GST Returns</h1>
          <p className="text-gray-600 mt-2">Track and manage all your GST return filings</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Total Returns</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
              <p className="text-green-600 text-xs mt-2">✓ All types covered</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Filed This Year</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
              <p className="text-green-600 text-xs mt-2">On schedule</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Due Soon</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">1</p>
              <p className="text-yellow-600 text-xs mt-2">Action required</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Overdue</p>
              <p className="text-3xl font-bold text-red-600 mt-2">1</p>
              <p className="text-red-600 text-xs mt-2">Please file now</p>
            </div>
          </div>

          {/* Return Summary Table */}
          <ReturnSummary />

          {/* Important Dates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Important Dates</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-4 pb-3 border-b border-gray-200">
                <div className="text-blue-600 font-bold">GSTR 1</div>
                <div>
                  <p className="text-gray-900 font-medium">Monthly Return Due: 11th of next month</p>
                  <p className="text-sm text-gray-600">For businesses with regular turnover</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-3 border-b border-gray-200">
                <div className="text-blue-600 font-bold">GSTR 3B</div>
                <div>
                  <p className="text-gray-900 font-medium">Monthly Return Due: 20th of next month</p>
                  <p className="text-sm text-gray-600">Summary of supplies and input tax credit</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-3">
                <div className="text-blue-600 font-bold">GSTR 9</div>
                <div>
                  <p className="text-gray-900 font-medium">Annual Return Due: 31st Dec following FY</p>
                  <p className="text-sm text-gray-600">Annual consolidation of returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
