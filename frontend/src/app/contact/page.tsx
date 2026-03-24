import React from 'react';
import ContactForm from '../../components/ContactForm';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in touch with our tax experts</h1>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8">Whether you need help filing ITR, GST returns, or business compliance — we’re here to help. Choose a contact method below or send us a message.</p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
            <div className="glassmorphic-dark rounded-xl p-6 flex-1 border border-slate-500/20">
              <h3 className="text-xl font-semibold text-white mb-2">Chat with Us</h3>
              <p className="text-slate-400 mb-4">Connect instantly via live chat for quick queries and support.</p>
              <Link href="/chat" className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg">Start Chat</Link>
            </div>

            <div className="glassmorphic-dark rounded-xl p-6 flex-1 border border-slate-500/20">
              <h3 className="text-xl font-semibold text-white mb-2">Call Us</h3>
              <p className="text-slate-400 mb-4">Speak directly to our support team.</p>
              <a href="tel:+919321908755" className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg">+91 93219 08755</a>
            </div>

            <div className="glassmorphic-dark rounded-xl p-6 flex-1 border border-slate-500/20">
              <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
              <p className="text-slate-400 mb-4">Send details and our team will get back within 24 hours.</p>
              <a href="mailto:support@gsttaxwale.com" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg">support@gsttaxwale.com</a>
            </div>
          </div>

        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glassmorphic-dark rounded-xl p-8 border border-slate-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="py-12 px-6 border-t border-slate-700/30">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400">Prefer self-help? Check our <Link href="/resources" className="text-orange-400 underline">Resources</Link> and <Link href="/pricing" className="text-orange-400 underline">Pricing</Link> pages for quick answers.</p>
        </div>
      </section>
    </div>
  );
}
