'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function CalculatorPage(){
  const [income, setIncome] = useState('');
  const [deductions, setDeductions] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try{
      const res = await api.post('/tax/calc', { income: Number(income), deductions: Number(deductions) });
      setResult(res.data);
    }catch(err){
      console.error(err);
      setResult({ error: 'Calculation failed' });
    }finally{setLoading(false)}
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Tax Calculator</h1>
      <form onSubmit={handleCalculate} className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Income</label>
          <input value={income} onChange={(e)=>setIncome(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Deductions</label>
          <input value={deductions} onChange={(e)=>setDeductions(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading? 'Calculating...':'Calculate'}</button>
        </div>
        {result && (
          <div className="mt-4 bg-gray-50 p-4 rounded">
            {result.error ? <div className="text-red-600">{result.error}</div> : (
              <div>
                <div>Taxable Income: ₹{result.taxableIncome}</div>
                <div>Tax: ₹{result.tax}</div>
                <div>Refund: ₹{result.refund || 0}</div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
