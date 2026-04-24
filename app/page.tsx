import React from 'react';
import Link from 'next/link';

export default async function HomePage() {
  // Fetch services from our unified API
  let services = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com';
    const res = await fetch(`${baseUrl}/api/services`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    const json = await res.json();
    services = json.data?.services || [];
  } catch (e) {
    console.error('Failed to fetch services:', e);
    services = [];
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-blue-600/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="text-6xl">💰</div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Financial Peace of Mind with <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">Easy Tax Compliance</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Expert-assisted GST filing, income tax returns, and professional tax consulting. Let our team of certified professionals handle your compliance while you focus on growth.
            </p>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mb-10 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-amber-400">4.9★</div>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Average Rating</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-400">15,000+</div>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Happy Clients</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-400">100%</div>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Compliant</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services" className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-amber-600/50 transition font-semibold text-lg">
                Explore All Services
              </Link>
              <Link href="/contact" className="border-2 border-slate-400 hover:border-purple-400 text-slate-300 hover:text-white px-8 py-3 rounded-lg transition font-semibold text-lg backdrop-blur-sm">
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', icon: '🔗', title: 'Connect Instantly', desc: 'Get expert support through live chat, email, or schedule a call' },
              { step: '2', icon: '📄', title: 'Share Your Details', desc: 'Upload documents securely - GST certificates, tax proofs, filings' },
              { step: '3', icon: '✓', title: 'Review & Approve', desc: 'Our experts prepare and summarize your filing for approval' },
              { step: '4', icon: '⚡', title: 'File & Complete', desc: 'We file your return and ensure 100% compliance' }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl shadow-lg">
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
                {idx !== 3 && (
                  <div className="hidden md:block absolute top-8 -right-6 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 px-4 bg-slate-800/20 border-y border-slate-700/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-amber-400 mb-2">97.4%</div>
              <p className="text-slate-400 text-sm">First-Time Accuracy</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">24 Hours*</div>
              <p className="text-slate-400 text-sm">Typical Turnaround</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">₹500+Cr</div>
              <p className="text-slate-400 text-sm">Tax Saved For Users</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">2600+</div>
              <p className="text-slate-400 text-sm">Towns Served</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-950 via-blue-950/50 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <div className="text-5xl">📊</div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Comprehensive Tax Solutions</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Everything your business needs for complete tax compliance</p>
          </div>

          {services.length === 0 ? (
            <div className="glassmorphic-dark rounded-xl border border-slate-500/20 p-12 text-center">
              <p className="text-slate-300 mb-4 text-lg">Services are being loaded...</p>
              <p className="text-slate-400 text-sm">Please check back shortly or contact our team</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {services.map((service: any) => (
                <div key={service.id} className="glassmorphic border border-slate-500/30 rounded-xl p-6 hover:border-amber-500/50 transition">
                  <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-slate-300 mb-4">{service.description}</p>
                  <div className="text-3xl font-bold text-amber-400 mb-4">₹{service.price}</div>
                  <Link href={`/checkout?serviceId=${service.id}`} className="block w-full bg-gradient-to-r from-amber-600 to-yellow-500 text-white text-center py-2 rounded-lg hover:from-amber-700 hover:to-yellow-600 transition">
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/services" className="inline-block bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-amber-600/50 transition font-semibold text-lg">
              View All Services →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
