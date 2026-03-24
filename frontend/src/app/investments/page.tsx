import React from 'react';
import Link from 'next/link';

export default function InvestmentsPage(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Investments & Tax Planning</h1>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8">Tools and advice to optimise tax-efficient investments.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20">
              <h3 className="text-xl font-semibold text-white mb-2">Mutual Funds (Zero-Commission)</h3>
              <p className="text-slate-400 mb-4">Compare top funds and plan SIPs.</p>
              <Link href="/" className="text-orange-400 underline">Explore →</Link>
            </div>
            <div className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20">
              <h3 className="text-xl font-semibold text-white mb-2">NPS & PPF Guidance</h3>
              <p className="text-slate-400 mb-4">Long-term tax-saving instruments explained.</p>
              <Link href="/" className="text-orange-400 underline">Learn more →</Link>
            </div>
            <div className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20">
              <h3 className="text-xl font-semibold text-white mb-2">Portfolio Doctor</h3>
              <p className="text-slate-400 mb-4">AI-backed portfolio analysis for tax efficiency.</p>
              <Link href="/" className="text-orange-400 underline">Analyze →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
