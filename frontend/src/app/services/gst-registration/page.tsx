'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

export default function GSTServicePage() {
  const [showPricing, setShowPricing] = useState(false);

  const features = [
    'Complete GST Registration guidance',
    'Monthly GSTR-1 filing (Sales)',
    'Quarterly GSTR-3B filing',
    'ITC (Input Tax Credit) management',
    'GST compliance checks',
    'Annual GST audit',
    'Error correction returns',
    'Dedicated support team'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/services" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition">
            <ArrowLeft size={20} />
            Back to Services
          </Link>
          <div className="text-xl font-bold text-amber-400">GST Tax Wale</div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-full mb-4">
              <span className="text-amber-300 text-sm font-semibold">Popular Service</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-white">
              GST Registration & Filing
            </h1>
            <p className="text-xl text-slate-300 mb-6">
              Complete Goods and Services Tax (GST) registration, compliance, and quarterly filing services for businesses of all sizes.
            </p>
            <div className="text-4xl font-bold text-amber-400 mb-8">
              ₹2,999 <span className="text-sm text-slate-400">/year</span>
            </div>
            <button className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-lg hover:from-amber-700 hover:to-yellow-600 font-semibold flex items-center gap-2 transition">
              <ShoppingCart size={20} />
              Subscribe Now
            </button>
          </div>

          <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-500/30 rounded-lg p-8 backdrop-blur">
            <h3 className="text-2xl font-bold text-amber-300 mb-6">What's Included</h3>
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

      {/* Detailed Features */}
      <div className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-700/50">
        <h2 className="text-3xl font-bold mb-12">Complete Feature Set</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
              <CheckCircle size={24} className="text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-lg text-white">{feature}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ/Process */}
      <div className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-700/50">
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>
        <div className="space-y-6">
          {[
            { step: 1, title: 'Register', desc: 'Submit your business details and GST application documents' },
            { step: 2, title: 'Verification', desc: 'Our expert team verifies and processes your GST registration' },
            { step: 3, title: 'Approval', desc: 'Receive your GST certificate and start filing' },
            { step: 4, title: 'Support', desc: 'Ongoing monthly and quarterly filing support' }
          ].map((item) => (
            <div key={item.step} className="flex gap-6 items-start">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-yellow-500 flex-shrink-0">
                <span className="text-lg font-bold text-white">{item.step}</span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-slate-300">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-700/50">
        <div className="bg-gradient-to-r from-amber-600 to-yellow-500 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to simplify GST compliance?</h2>
          <p className="text-amber-50 mb-8 text-lg">Start your GST registration journey today with expert guidance</p>
          <button className="px-8 py-3 bg-white text-amber-600 rounded-lg hover:bg-amber-50 font-semibold transition">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
