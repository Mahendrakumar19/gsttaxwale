'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="pt-24 pb-6 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About GST Tax Wale</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your trusted partner for GST and Income Tax compliance
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 border-b border-gray-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              At GST Tax Wale, we believe that tax compliance should be simple, affordable, and stress-free. 
              We are committed to helping businesses and individuals navigate the complex world of GST and 
              Income Tax filing with ease.
            </p>
            <p className="text-gray-600 mb-4">
              Our team of expert Chartered Accountants and tax professionals work tirelessly to ensure 
              your compliance requirements are met on time, every time.
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
            <p className="text-4xl font-bold text-blue-600 mb-2">1100+</p>
            <p className="text-gray-600 font-semibold mb-6">Clients Served</p>
            <hr className="mb-6" />
            <p className="text-2xl font-bold text-blue-600 mb-2">15+</p>
            <p className="text-gray-600 font-semibold">Years of Experience</p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Professionalism</h3>
              <p className="text-gray-600">
                We uphold the highest standards of professional ethics and deliver excellence in every engagement.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Integrity</h3>
              <p className="text-gray-600">
                Trust is the foundation of our relationships. We are transparent and honest in all dealings.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Commitment</h3>
              <p className="text-gray-600">
                We are dedicated to your success and work tirelessly to achieve your tax compliance goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Individual Tax Services</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ ITR Filing (Form 1-5)</li>
                <li>✓ Income Tax Planning</li>
                <li>✓ NRI Taxation</li>
                <li>✓ Capital Gains Planning</li>
                <li>✓ Property Tax Setup</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🏢 Business Tax Services</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ GST Registration & Filing</li>
                <li>✓ TDS Compliance</li>
                <li>✓ Payroll Compliance</li>
                <li>✓ Audit Support</li>
                <li>✓ Business Consulting</li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* Team Section */}
      <section className="py-16 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Expert Team</h2>
          <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
            <p className="text-gray-600 max-w-3xl mx-auto mb-4">
              Our team consists of experienced Chartered Accountants (CAs), tax consultants, and compliance experts 
              with deep expertise in GST and Income Tax regulations. We stay updated with the latest tax laws and 
              regulatory changes to provide you with accurate, timely guidance.
            </p>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Each team member is committed to delivering personalized service and ensuring your complete satisfaction.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
