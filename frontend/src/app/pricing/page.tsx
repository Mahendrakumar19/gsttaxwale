import React from 'react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8">Choose a plan that fits your needs — no hidden fees, clear deliverables, and expert-backed service.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Basic', price: '₹499', perks:['ITR Filing', 'Email Support'] },
              { name: 'Pro', price: '₹1,499', perks:['ITR + TDS Support','Priority Chat'] },
              { name: 'Business', price: 'Custom', perks:['GST Filing','Accountant Support','Compliance'] }
            ].map((plan, idx) => (
              <div key={idx} className="glassmorphic-dark rounded-xl p-6 border border-slate-500/20">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-4">{plan.price}</div>
                <ul className="text-slate-300 mb-6 space-y-2">
                  {plan.perks.map((p:string,i:number)=> <li key={i}>✓ {p}</li>)}
                </ul>
                <Link href="/contact" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg">Choose {plan.name}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
