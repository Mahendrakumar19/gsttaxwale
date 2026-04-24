'use client';

import Link from 'next/link';
import { CheckCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

export default function ESICEPFPage() {
  const features = [
    'ESIC registration assistance',
    'EPF account registration',
    'Monthly ECR filing',
    'Employee claim assistance',
    'Compliance calendar management',
    'Annual EOY processing',
    'PF ledger maintenance',
    'Employee grievance support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white">
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/services" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition">
            <ArrowLeft size={20} />
            Back to Services
          </Link>
          <div className="text-xl font-bold text-amber-400">GST Tax Wale</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full mb-4">
              <span className="text-green-300 text-sm font-semibold">Employee Benefits</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-white">ESIC & EPF Registration</h1>
            <p className="text-xl text-slate-300 mb-6">
              Employee State Insurance and Employees Provident Fund registration and ongoing compliance services.
            </p>
            <div className="text-4xl font-bold text-green-400 mb-8">
              ₹2,499 <span className="text-sm text-slate-400">/month</span>
            </div>
            <button className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:from-green-700 hover:to-emerald-600 font-semibold flex items-center gap-2 transition">
              <ShoppingCart size={20} />
              Subscribe Now
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-lg p-8 backdrop-blur">
            <h3 className="text-2xl font-bold text-green-300 mb-6">What's Included</h3>
            <div className="space-y-4">
              {features.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-slate-200">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-700/50">
        <h2 className="text-3xl font-bold mb-12">Complete Feature Set</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
              <CheckCircle size={24} className="text-green-400 flex-shrink-0 mt-1" />
              <h4 className="font-semibold text-white">{feature}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
