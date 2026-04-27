"use client";
import React from 'react';
import Link from 'next/link';
import StickyReferralButton from '../components/StickyReferralButton';
import ImageSlider from '../components/ImageSlider';
import NewsSection from '../components/NewsSection';
import DueDatesSection from '../components/DueDatesSection';

export default function HomePage() {
  React.useEffect(() => {
    // Migration: Clear old persistent localStorage sessions once 
    // to prevent "automatic login" from previous builds
    const keys = ['token', 'user', 'adminToken', 'adminUser', 'userRole'];
    keys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) {
        // One-time migration to sessionStorage if they were logged in
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, val);
        }
        localStorage.removeItem(key);
      }
    });
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              Complete Tax & Compliance Solutions
            </h1>
            <p className="max-w-3xl mx-auto mb-8 text-base text-gray-600 md:text-lg">
              Professional GST filing, income tax returns, and business compliance services
            </p>
            {/* Image Slider */}
            <ImageSlider autoPlay={true} interval={4000} />
          </div>
        </div>
      </section>


      {/* News & Updates Section */}
      <section className="px-4 py-16 bg-gray-50 border-t border-blue-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* News Section - Full Width */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h2 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">GST News & Updates</h2>
                <p className="text-gray-600">Latest news, announcements, and policy updates from GST authorities</p>
              </div>
              <NewsSection limit={6} />
            </div>
          </div>
        </div>
      </section>



      {/* How It Works Section */}
      <section className="px-4 py-16 border-t border-blue-100 bg-blue-50/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 md:text-4xl">How It Works</h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { step: '1', icon: '🔗', title: 'Connect', desc: 'Share your details securely' },
              { step: '2', icon: '📄', title: 'Prepare', desc: 'We prepare your documents' },
              { step: '3', icon: '✓', title: 'Review', desc: 'You approve the filing' },
              { step: '4', icon: '⚡', title: 'File', desc: 'We file and ensure compliance' }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="p-5 text-center transition bg-white border border-blue-100 rounded-xl hover:border-blue-400">
                  <div className="inline-flex items-center justify-center mb-3 text-lg font-bold text-blue-600 bg-blue-100 rounded-full shadow-sm w-14 h-14">
                    {item.step}
                  </div>
                  <div className="mb-2 text-2xl">{item.icon}</div>
                  <h3 className="mb-1 text-base font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
                {idx !== 3 && (
                  <div className="hidden md:block absolute top-7 -right-5 w-10 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="px-4 py-12 bg-white border-t border-b border-blue-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <div>
              <div className="mb-1 text-3xl font-bold text-blue-600">10,000+</div>
              <p className="text-xs text-gray-600">Clients Served</p>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold text-blue-600">15+</div>
              <p className="text-xs text-gray-600">Expert CAs</p>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold text-blue-600">100%</div>
              <p className="text-xs text-gray-600">Compliant</p>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold text-blue-600">365</div>
              <p className="text-xs text-gray-600">Days Support</p>
            </div>
          </div>
        </div>
      </section>


      {/* Why Choose Us Section */}
      <section className="px-4 py-16 bg-white border-t border-blue-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 md:text-4xl">Why Choose Us?</h2>

          <div className="grid grid-cols-1 gap-5 mb-10 md:grid-cols-2">
            {[
              { title: 'Expert CA Professionals', desc: 'Certified professionals with decades of combined experience in tax and compliance' },
              { title: '10AM - 6PM Customer Support', desc: 'Available to answer your questions and provide expert guidance' },
              { title: '100% Accuracy Guaranteed', desc: 'Our meticulous process ensures zero errors in your tax filings' },
              { title: 'Secure Data Protection', desc: 'Military-grade encryption protects all your sensitive financial data' },
              { title: 'Fast Processing', desc: 'Get your filings done quickly without compromising on quality' },
              { title: 'Transparent Pricing', desc: 'No hidden charges - you know exactly what you are paying for' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3 p-5 transition border border-blue-100 bg-blue-50/60 rounded-xl hover:border-blue-400">
                <div className="flex-shrink-0 text-2xl">✓</div>
                <div>
                  <h3 className="mb-1 text-base font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 border-t border-blue-100 bg-blue-50/40">
        <div className="max-w-3xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 md:text-4xl">Frequently Asked Questions</h2>
          
          <div className="space-y-3">
            {[
              { q: 'How long does tax filing take?', a: 'Typically 24-48 hours. Our expert team works fast to ensure quick turnaround without compromising accuracy.' },
              { q: 'Is my data secure?', a: 'Yes. We use 256-bit SSL encryption and follow all data protection regulations to keep your information safe.' },
              { q: 'Do you provide support after filing?', a: 'Absolutely. We provide free support for 365 days including notice handling and compliance queries.' },
              { q: 'What documents do I need?', a: 'Typically: GST certificates, tax ID proofs, business documents, and income details. We guide you through everything.' }
            ].map((item, idx) => (
              <div key={idx} className="p-5 transition bg-white border border-blue-100 rounded-xl hover:border-blue-400">
                <h3 className="mb-2 text-sm font-semibold text-blue-600">Q: {item.q}</h3>
                <p className="text-sm text-gray-600">A: {item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-16 bg-white border-t border-blue-100">
        <div className="max-w-4xl mx-auto">
          <div className="p-10 text-center border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
            <div className="mb-3 text-4xl">🚀</div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">Ready to Simplify Your Tax Compliance?</h3>
            <p className="max-w-2xl mx-auto mb-6 text-sm text-gray-700 md:text-base">
              Join thousands of businesses that have simplified their tax compliance with our expert support
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/services" className="px-6 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-lg">
                Get Started Today
              </Link>
              <Link href="/contact" className="px-6 py-2 text-sm font-medium text-blue-600 transition border-2 border-blue-600 rounded-lg hover:bg-blue-100">
                Schedule Free Call
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

