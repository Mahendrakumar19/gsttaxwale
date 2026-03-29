import { notFound } from 'next/navigation';
import api from '@/lib/api';

export default async function FilingDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  
  // Fetch filing data server-side
  let filing = null;
  try {
    const res = await api.get(`/api/filings/${id}`);
    filing = res.data || null;
  } catch (err) {
    console.error('Failed to load filing', err);
    notFound();
  }

  if (!filing) {
    notFound();
  }

  return (
    <div className="max-w-4xl p-6 mx-auto bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Filing: {filing.financialYear}</h2>
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
