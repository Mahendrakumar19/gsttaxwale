'use client';

import Link from 'next/link';
import { Clock, Home } from 'lucide-react';

export default function PaymentPending() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Clock size={48} className="text-yellow-400" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Pending</h1>
        <p className="text-gray-700 mb-8">Your payment is being processed. Please wait...</p>

        <div className="bg-slate-800/50 border border-yellow-500/30 rounded-lg p-6 mb-8">
          <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-700 text-sm mt-4">
            Do not close this window. We're verifying your payment with the bank.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-amber-100 text-sm">Typical processing time: 2-5 minutes</p>

          <Link href="/" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">
            <Home size={18} />
            Back to Home
          </Link>

          <Link href="/dashboard" className="text-amber-400 hover:text-amber-300 font-bold transition">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
