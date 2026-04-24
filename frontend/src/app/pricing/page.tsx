import React from 'react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Pricing Page Moved
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            We've consolidated all our services and pricing information into one convenient location.
          </p>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-lg p-12 mb-8">
          <div className="mb-6">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Services & Pricing Combined
            </h2>
            <p className="text-gray-600 mb-6">
              Visit our Services page to view all available tax and compliance solutions with transparent pricing for each service.
            </p>
          </div>

          <Link href="/services" className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            View Services & Pricing →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-bold text-gray-900 mb-2">All Services Listed</h3>
            <p className="text-sm text-gray-600">Complete catalog of tax and compliance services in one place</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold text-gray-900 mb-2">Transparent Pricing</h3>
            <p className="text-sm text-gray-600">Clear, upfront pricing for each service with no hidden fees</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-bold text-gray-900 mb-2">Easy Comparison</h3>
            <p className="text-sm text-gray-600">Compare features and prices easily across all offerings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
