import React from 'react';
import ContactForm from '../../components/ContactForm';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Investments Section */}
      <section className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Investments & Tax Planning</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">Tools and advice to optimise tax-efficient investments.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl p-6 border border-gray-200 bg-white hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mutual Funds (Zero-Commission)</h3>
              <p className="text-gray-600 mb-4">Compare top funds and plan SIPs.</p>
              <Link href="/" className="text-blue-600 underline hover:text-blue-700">Explore →</Link>
            </div>
            <div className="rounded-xl p-6 border border-gray-200 bg-white hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">NPS & PPF Guidance</h3>
              <p className="text-gray-600 mb-4">Long-term tax-saving instruments explained.</p>
              <Link href="/" className="text-blue-600 underline hover:text-blue-700">Learn more →</Link>
            </div>
            <div className="rounded-xl p-6 border border-gray-200 bg-white hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Portfolio Doctor</h3>
              <p className="text-gray-600 mb-4">AI-backed portfolio analysis for tax efficiency.</p>
              <Link href="/" className="text-blue-600 underline hover:text-blue-700">Analyze →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Section */}
      <section className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Corporate Tie-ups & Partnerships</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">Partner with us for employee tax benefits, bulk filings, and compliance support.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Employee Benefits Programs</h3>
              <p className="text-gray-600 mb-4">Offer your employees assisted filing and tax planning as a corporate benefit.</p>
              <Link href="#contact-form" className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition">Get Partnership Info</Link>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bulk Filings & Compliance</h3>
              <p className="text-gray-600 mb-4">Scalable solutions for payroll TDS, GST returns, and statutory compliance.</p>
              <Link href="#contact-form" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition">Request a Quote</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pt-12 pb-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get in touch with our tax experts</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">Whether you need help filing ITR, GST returns, or business compliance — we're here to help. Choose a contact method below or send us a message.</p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
            <div className="glassmorphic-dark rounded-xl p-6 flex-1 border border-slate-500/20">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat with Us</h3>
              <p className="text-gray-600 mb-4">Connect instantly via live chat for quick queries and support.</p>
              <Link href="/chat" className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg">Start Chat</Link>
            </div>

            <div className="glassmorphic-dark rounded-xl p-6 flex-1 border border-slate-500/20">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">Speak directly to our support team.</p>
              <a href="tel:+919321908755" className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg">+91 93219 08755</a>
            </div>

            <div className="glassmorphic-dark rounded-xl p-6 flex-1 border border-slate-500/20">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-4">Send details and our team will get back within 24 hours.</p>
              <a href="mailto:support@gsttaxwale.com" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg">support@gsttaxwale.com</a>
            </div>
          </div>

        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto" id="contact-form">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">Prefer self-help? Check our <Link href="/resources" className="text-blue-600 underline hover:text-blue-700">Resources</Link> and <Link href="/pricing" className="text-blue-600 underline hover:text-blue-700">Pricing</Link> pages for quick answers.</p>
        </div>
      </section>
    </div>
  );
}
