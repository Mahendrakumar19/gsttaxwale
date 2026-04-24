'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function FilingsPage() {
  const [filings, setFilings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilings();
  }, []);

  const fetchFilings = async () => {
    try {
      const res = await api.get('/filings');
      setFilings(res.data || []);
    } catch (err) {
      console.error('Failed to load filings', err);
      setFilings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Filings</h1>
        <Link href="/dashboard" className="text-indigo-600">Back to Dashboard</Link>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : filings.length === 0 ? (
        <p className="text-gray-600">No filings found. Create one from the dashboard.</p>
      ) : (
        <ul className="space-y-2">
          {filings.map((f) => (
            <li key={f.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
              <div>
                <div className="font-semibold">{f.financialYear}</div>
                <div className="text-sm text-gray-500">Status: {f.status}</div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/filings/${f.id}`} className="text-indigo-600">View</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
