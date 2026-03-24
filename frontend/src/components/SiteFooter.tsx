import React from 'react';
import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="glassmorphic border-t border-slate-600 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="gradient-text font-bold text-lg mb-3">GST Tax Wale</div>
            <p className="text-slate-400 text-sm">Professional GST & Income Tax Services for Businesses & Individuals</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/services" className="hover:text-orange-400 transition">View All Services</Link></li>
              <li><Link href="/services" className="hover:text-orange-400 transition">GST Filing</Link></li>
              <li><Link href="/services" className="hover:text-orange-400 transition">ITR Filing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/contact" className="hover:text-orange-400 transition">Contact Us</Link></li>
              <li><Link href="/" className="hover:text-orange-400 transition">FAQ</Link></li>
              <li><a href="mailto:support@gsttaxwale.com" className="hover:text-orange-400 transition">Email Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-orange-400 transition">Terms of Service</Link></li>
              <li><Link href="/" className="hover:text-orange-400 transition">Privacy Policy</Link></li>
              <li><Link href="/" className="hover:text-orange-400 transition">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-600 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-xs text-slate-500">© {new Date().getFullYear()} GST Tax Wale — All rights reserved.</div>
          <div className="flex space-x-6 mt-4 md:mt-0 text-slate-400 text-sm">
            <span>📧 support@gsttaxwale.com</span>
            <span>📞 +91 9876543210</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
