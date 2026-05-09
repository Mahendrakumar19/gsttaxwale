'use client';

import React from 'react';
import Link from 'next/link';

const ITR_DUE_DATES = [
  {
    category: 'Individual (Non-Resident)',
    deadline: 'July 31',
    fy: 'Current Financial Year',
    extension: 'November 30 (with penalty)',
    note: 'If income only from salary and other sources'
  },
  {
    category: 'Individual (with Business/Profession)',
    deadline: 'September 30',
    fy: 'Current Financial Year',
    extension: 'December 31 (with penalty)',
    note: 'Carrying on business or profession'
  },
  {
    category: 'Company',
    deadline: 'September 30',
    fy: 'Current Financial Year',
    extension: 'December 31 (with penalty)',
    note: 'All companies (except exempted companies)'
  },
  {
    category: 'Partnership Firm',
    deadline: 'September 30',
    fy: 'Current Financial Year',
    extension: 'December 31 (with penalty)',
    note: 'All partnership firms'
  },
  {
    category: 'Cooperative Society',
    deadline: 'September 30',
    fy: 'Current Financial Year',
    extension: 'December 31 (with penalty)',
    note: 'All cooperative societies'
  },
  {
    category: 'Trust',
    deadline: 'September 30',
    fy: 'Current Financial Year',
    extension: 'December 31 (with penalty)',
    note: 'Charitable and non-charitable trusts'
  },
];

const IMPORTANT_DATES = [
  { event: 'Financial Year Ends', date: 'March 31' },
  { event: 'Assessment Year Starts', date: 'April 1' },
  { event: 'Due Date for Most Individuals', date: 'July 31' },
  { event: 'Due Date for Business Owners', date: 'September 30' },
  { event: 'Last Date for Extension (with penalty)', date: 'November 30 / December 31' },
];

export default function IncomeTaxDueDatesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="pt-24 pb-6 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Income Tax Due Dates</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Never miss an ITR filing deadline. Check filing dates for different entity types.
          </p>
        </div>
      </section>

      {/* Due Dates Table */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">ITR Filing Due Dates (FY 2024-25)</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50 border border-gray-200">
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Entity Type</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Normal Deadline</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Extended Deadline</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Notes</th>
                </tr>
              </thead>
              <tbody>
                {ITR_DUE_DATES.map((row, idx) => (
                  <tr key={idx} className="border border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.category}</td>
                    <td className="px-6 py-4 text-gray-600">{row.deadline}</td>
                    <td className="px-6 py-4 text-gray-600">{row.extension}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="py-16 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Important Tax Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {IMPORTANT_DATES.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-gray-600 text-sm mb-2">{item.event}</p>
                <p className="text-2xl font-bold text-blue-600">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 border-t border-gray-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Don't Miss Your ITR Deadline</h2>
          <p className="text-gray-600 mb-8">Let our tax experts handle your ITR filing. Avoid penalties and ensure compliance.</p>
          <Link href="/services" className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition">
            Explore ITR Filing Services
          </Link>
        </div>
      </section>
    </div>
  );
}
