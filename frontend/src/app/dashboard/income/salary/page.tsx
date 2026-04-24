'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function SalaryIncomePage() {
  const [employer, setEmployer] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/income', {
        type: 'salary',
        source: employer,
        amount: Number(amount),
      });
      setMessage('Salary income added');
      setEmployer('');
      setAmount('');
    } catch (err) {
      console.error(err);
      setMessage('Failed to add income');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Add Salary Income</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Employer</label>
          <input value={employer} onChange={(e) => setEmployer(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <button disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">{loading ? 'Saving...' : 'Save'}</button>
        </div>
        {message && <div className="text-sm text-gray-600">{message}</div>}
      </form>
    </div>
  );
}
