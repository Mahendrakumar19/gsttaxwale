'use client';

import React from 'react';
import Link from 'next/link';

const GST_DUE_DATES = [
  {
    return: 'GSTR-1 (Outward Supplies)',
    deadline: '11th of Next Month',
    description: 'Sales and supply of goods/services',
    late_fee: '₹50-100 per day (Max ₹5,000)',
  },
  {
    return: 'GSTR-2A (Inward Supplies - Auto-populated)',
    deadline: '12th of Next Month',
    description: 'Automatically created from GSTR-1 filings of suppliers',
    late_fee: 'N/A - Auto-populated',
  },
  {
    return: 'GSTR-2 (Inward Supplies - Manual)',
    deadline: '15th of Next Month',
    description: 'Manual entry of purchases (being phased out)',
    late_fee: '₹50-100 per day (Max ₹5,000)',
  },
  {
    return: 'GSTR-3B (Summary Return)',
    deadline: '22nd of Next Month',
    description: 'Monthly summary of sales, purchases, and taxes',
    late_fee: '₹50-100 per day (Max ₹5,000)',
  },
  {
    return: 'GSTR-9 (Annual Return)',
    deadline: '31st December',
    description: 'Annual reconciliation return',
    late_fee: '₹100 per day (Max ₹25,000)',
  },
  {
    return: 'GSTR-9C (Reconciliation Statement)',
    deadline: '31st December',
    description: 'Required if turnover > ₹2 crore (audited accounts)',
    late_fee: '₹100 per day (Max ₹25,000)',
  },
];

const QUARTERLY_DATES = [
  { quarter: 'Q1 (Apr-Jun)', gstr1: 'July 11', gstr3b: 'July 22' },
  { quarter: 'Q2 (Jul-Sep)', gstr1: 'Oct 11', gstr3b: 'Oct 22' },
  { quarter: 'Q3 (Oct-Dec)', gstr1: 'Jan 11', gstr3b: 'Jan 22' },
  { quarter: 'Q4 (Jan-Mar)', gstr1: 'Apr 11', gstr3b: 'Apr 22' },
];

export default function GSTDueDatesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="pt-24 pb-6 border-b border-green-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">GST Due Dates Calendar</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay compliant with GST return filing deadlines. Never miss a filing date again.
          </p>
        </div>
      </section>

      {/* Monthly Due Dates */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Monthly GST Returns Due Dates</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-50 border border-gray-200">
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Return</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Due Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Late Fee</th>
                </tr>
              </thead>
              <tbody>
                {GST_DUE_DATES.map((row, idx) => (
                  <tr key={idx} className="border border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.return}</td>
                    <td className="px-6 py-4 text-gray-600 font-semibold">{row.deadline}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{row.description}</td>
                    <td className="px-6 py-4 text-red-600 text-sm">{row.late_fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Quarterly View */}
      <section className="py-16 px-6 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Quarterly GST Filing Calendar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {QUARTERLY_DATES.map((q, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{q.quarter}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">GSTR-1 & GSTR-2A</p>
                    <p className="text-xl font-bold text-green-600">{q.gstr1}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">GSTR-3B (Final Date)</p>
                    <p className="text-xl font-bold text-green-600">{q.gstr3b}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-16 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Important Points to Remember</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">📅 GSTR-1 First</h3>
              <p className="text-gray-600 text-sm">Always file GSTR-1 before GSTR-3B to avoid errors in tax calculation.</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="font-semibold text-gray-900 mb-3">⚠️ Late Fee Penalties</h3>
              <p className="text-gray-600 text-sm">Late fees start from day 1 of delay. Early filing saves money and compliance headaches.</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-3">📊 GSTR-2A Auto-filed</h3>
              <p className="text-gray-600 text-sm">GSTR-2A is automatically populated from your suppliers' GSTR-1. Review and verify it.</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-6 border border-pink-200">
              <h3 className="font-semibold text-gray-900 mb-3">✅ Annual Reconciliation</h3>
              <p className="text-gray-600 text-sm">File GSTR-9 and GSTR-9C before December 31 to close your financial year properly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 border-t border-gray-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Let Us Handle Your GST Filing</h2>
          <p className="text-gray-600 mb-8">Our experts ensure timely, accurate GST return filing. Avoid late fees and compliance issues.</p>
          <Link href="/services" className="inline-block bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition">
            Explore GST Services
          </Link>
        </div>
      </section>
    </div>
  );
}
