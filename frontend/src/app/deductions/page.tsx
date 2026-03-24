'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function DeductionsPage(){
  const [section, setSection] = useState('80C');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try{
      await api.post('/api/deductions', { section, amount: Number(amount) });
      setMessage('Deduction saved');
      setAmount('');
    }catch(err){
      console.error(err);
      setMessage('Failed to save deduction');
    }finally{setLoading(false)}
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Tax Deductions</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Section</label>
          <select value={section} onChange={(e)=>setSection(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded">
            <option>80C</option>
            <option>80D</option>
            <option>80E</option>
            <option>80G</option>
            <option>HRA</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input value={amount} onChange={(e)=>setAmount(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <button disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">{loading? 'Saving...':'Save'}</button>
        </div>
        {message && <div className="text-sm text-gray-600">{message}</div>}
      </form>
    </div>
  )
}
