import React from 'react';
import Link from 'next/link';

export default function CorporatePage(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Corporate Tie-ups & Partnerships</h1>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8">Partner with us for employee tax benefits, bulk filings, and compliance support.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20 text-left">
              <h3 className="text-xl font-semibold text-white mb-2">Employee Benefits Programs</h3>
              <p className="text-slate-400 mb-4">Offer your employees assisted filing and tax planning as a corporate benefit.</p>
              <Link href="/contact" className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg">Get Partnership Info</Link>
            </div>

            <div className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20 text-left">
              <h3 className="text-xl font-semibold text-white mb-2">Bulk Filings & Compliance</h3>
              <p className="text-slate-400 mb-4">Scalable solutions for payroll TDS, GST returns, and statutory compliance.</p>
              <Link href="/contact" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg">Request a Quote</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
