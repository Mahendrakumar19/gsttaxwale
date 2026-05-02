import React from 'react';
import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="mt-16 bg-white border-t border-blue-100">
      <div className="px-6 py-12 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-4">
          <div>
             <div className="flex items-center space-x-3">
                        <Link href="/" className="flex items-center space-x-2 transition hover:opacity-80">
                          <img src="/gsttaxwale_logo.svg" alt="GST Tax Wale" className="w-auto h-10" />
                        </Link>
                      </div>
            <p className="text-sm text-gray-600">Professional GST & Income Tax Services for Businesses & Individuals</p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-gray-900">Services</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/services" className="transition hover:text-blue-600">View All Services</Link></li>
              <li><Link href="/services" className="transition hover:text-blue-600">GST Filing</Link></li>
              <li><Link href="/services" className="transition hover:text-blue-600">ITR Filing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-gray-900">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/contact" className="transition hover:text-blue-600">Contact Us</Link></li>
              <li><Link href="/" className="transition hover:text-blue-600">FAQ</Link></li>
              <li><a href="mailto:help@gsttaxwale.com" className="transition hover:text-blue-600">Email Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-gray-900">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/" className="transition hover:text-blue-600">Terms of Service</Link></li>
              <li><Link href="/" className="transition hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="/" className="transition hover:text-blue-600">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between pt-8 border-t border-blue-100 md:flex-row">
          <div className="text-xs text-gray-500">© {new Date().getFullYear()} GST Tax Wale — All rights reserved.</div>
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
            {/* Contact Info */}
            <div className="flex mt-4 space-x-6 text-sm text-gray-600 md:mt-0">
              <span>📧 help@gsttaxwale.com</span>
              <span>📞 +91 7368038655</span>
            </div>
            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              <a 
                href="https://www.instagram.com/gsttaxwale/" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Follow us on Instagram @gsttaxwale"
                className="text-gray-600 transition hover:text-pink-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/gsttaxwale/" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Follow us on Facebook @gsttaxwale"
                className="text-gray-600 transition hover:text-blue-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.youtube.com/@gsttaxwale" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Subscribe to our YouTube channel @gsttaxwale"
                className="text-gray-600 transition hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
