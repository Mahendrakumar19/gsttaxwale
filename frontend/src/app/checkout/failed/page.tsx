'use client';

import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function PaymentFailed() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-500/10 border border-red-500/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={48} className="text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-700 mb-8">Your payment could not be processed. Please try again.</p>

        <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-gray-900 font-bold mb-3">What went wrong?</h3>
          <ul className="text-gray-700 text-sm space-y-2">
            <li>• Insufficient balance in your account</li>
            <li>• Card declined by your bank</li>
            <li>• Network connectivity error</li>
            <li>• Transaction timeout</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition">
            <RefreshCw size={18} />
            Try Again
          </button>

          <Link href="/" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">
            <Home size={18} />
            Back to Home
          </Link>

          <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-bold transition">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
