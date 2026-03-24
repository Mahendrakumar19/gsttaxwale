'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function FilingDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [filing, setFiling] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiling();
  }, [id]);

  const fetchFiling = async () => {
    try {
      const res = await api.get(`/api/filings/${id}`);
      setFiling(res.data || null);
    } catch (err) {
      console.error('Failed to load filing', err);
      setFiling(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (!filing) return <div className="p-6">Filing not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Filing: {filing.financialYear}</h2>
        <button onClick={() => router.back()} className="text-indigo-600">Back</button>
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <div><strong>Status:</strong> {filing.status}</div>
        <div><strong>Regime:</strong> {filing.regime}</div>
        <div><strong>Total Income:</strong> ₹{filing.totalIncome}</div>
        <div><strong>Total Deductions:</strong> ₹{filing.totalDeductions}</div>
        <div><strong>Tax Amount:</strong> ₹{filing.taxAmount}</div>
      </div>
    </div>
  );
}
