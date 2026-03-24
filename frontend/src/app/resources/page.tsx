import React from 'react';
import Link from 'next/link';

export default function ResourcesPage(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">Resources & Guides</h1>
          <p className="text-slate-300 text-center mb-8">How-to guides, calculators and FAQs to help you through tax processes.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20">
              <h3 className="text-xl font-semibold text-white mb-2">Form 16 Guide</h3>
              <p className="text-slate-400 mb-4">Step-by-step walkthrough for salaried employees.</p>
              <Link href="/" className="text-orange-400 underline">Read guide →</Link>
            </div>
            <div className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20">
              <h3 className="text-xl font-semibold text-white mb-2">GST Filing Checklist</h3>
              <p className="text-slate-400 mb-4">Prepare documents for smooth filing.</p>
              <Link href="/" className="text-orange-400 underline">Read checklist →</Link>
            </div>
            <div className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20">
              <h3 className="text-xl font-semibold text-white mb-2">Tax Calculators</h3>
              <p className="text-slate-400 mb-4">Income, TDS, Capital Gains and more.</p>
              <Link href="/calculator" className="text-orange-400 underline">Use calculators →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
