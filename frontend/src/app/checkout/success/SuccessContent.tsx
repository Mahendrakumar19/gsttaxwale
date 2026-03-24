'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessContent() {
  const search = useSearchParams();
  const orderId = search.get('orderId');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto text-center bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold text-green-700">Payment Successful</h1>
        <p className="mt-3 text-gray-700">Thank you! Your order has been placed.</p>
        {orderId && <div className="mt-4 text-sm text-gray-600">Order ID: {orderId}</div>}
      </div>
    </div>
  );
}
