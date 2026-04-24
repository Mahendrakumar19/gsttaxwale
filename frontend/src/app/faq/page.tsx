'use client';

import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    {
      category: 'GST Services',
      questions: [
        {
          q: 'Who is required to register for GST?',
          a: 'Any individual or business with annual turnover exceeding ₹40 lakhs (₹20 lakhs for special category states) is required to register for GST. Even below this limit, you can voluntarily register.'
        },
        {
          q: 'What documents are needed for GST registration?',
          a: 'You need PAN, Aadhar, business proof (utility bill), bank account details, and passport size photo. We handle the entire registration process for you.'
        },
        {
          q: 'How often should I file GST returns?',
          a: 'GSTR-1 and GSTR-3B are filed monthly by the 20th of next month. GSTR-6, GSTR-9 have different timelines. Our platform sends you reminders.'
        },
        {
          q: 'What if I miss GST filing deadline?',
          a: 'Late filing attracts penalties. GSTR-1 violations can result in 10% penalty on tax due. We help you file on time with automated reminders.'
        },
      ]
    },
    {
      category: 'Income Tax',
      questions: [
        {
          q: 'By when should I file my income tax return (ITR)?',
          a: 'ITR filing deadline is 31st July for the previous financial year. Filing after this attracts penalties and interest on tax due.'
        },
        {
          q: 'What is the difference between old and new tax regime?',
          a: 'Old regime allows deductions (80C, 80D, etc.) but has higher tax rates. New regime has lower rates but no deductions. We help you choose what saves more tax.'
        },
        {
          q: 'How much can I claim under Section 80C?',
          a: 'Maximum deduction under 80C is ₹150,000 annually. This includes LIC, EPF, PPF, ELSS, and education loan principal.'
        },
        {
          q: 'What if my income is below taxable limit?',
          a: 'Even if your income is below ₹2.5 lakhs, filing ITR is important for maintaining financial records. You may get tax refunds on deductions claimed.'
        },
      ]
    },
    {
      category: 'Billing & Payments',
      questions: [
        {
          q: 'What are your service charges?',
          a: 'GST Registration: ₹2,999 | ITR Filing: ₹1,999 | Company Registration: ₹4,999 | TDS Filing: ₹1,499/quarter | ESIC/EPF: ₹2,499/month | Trademark: ₹3,999'
        },
        {
          q: 'Do you have auto-charging subscriptions?',
          a: 'No! We charge only for services you request. No hidden charges, no auto-renewals. Transparency is our policy.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept credit cards, debit cards, net banking, UPI, and wallet payments. All transactions are secured with SSL encryption.'
        },
        {
          q: 'Can I get an invoice for my payment?',
          a: 'Yes, invoices are generated automatically and sent to your email. You can download them anytime from your dashboard.'
        },
      ]
    },
    {
      category: 'Data Security',
      questions: [
        {
          q: 'How is my data protected?',
          a: 'We use bank-level SSL encryption for all data. Your information is stored on secure servers with regular backups. We comply with data protection laws.'
        },
        {
          q: 'Can I download or export my data?',
          a: 'Yes, you can download all your filed documents, returns, and records from the dashboard anytime. Your data belongs to you.'
        },
        {
          q: 'Is my information shared with third parties?',
          a: 'No. We never share your personal or financial information with anyone except as legally required (government filings, etc.).'
        },
        {
          q: 'What if my account is hacked?',
          a: 'All accounts are protected with password encryption and 2-factor authentication. If compromised, please contact support immediately.'
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-amber-100">
          Find answers to common questions about our services
        </p>
      </section>

      {/* FAQ Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {faqs.map((section, idx) => (
          <div key={idx} className="mb-12">
            <h2 className="text-2xl font-bold text-amber-300 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-gradient-to-b from-amber-400 to-yellow-400 rounded-full"></span>
              {section.category}
            </h2>
            <div className="space-y-4">
              {section.questions.map((item, qIdx) => (
                <FAQItem key={qIdx} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Contact Support */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center bg-slate-800/50 rounded-lg my-12">
        <h2 className="text-2xl font-bold text-white mb-4">Didn't find your answer?</h2>
        <p className="text-amber-100 mb-6">Our support team is here to help you 24/7</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://wa.me/919999999999" className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition">
            Chat on WhatsApp
          </a>
          <a href="/contact" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition">
            Email Us
          </a>
        </div>
      </section>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition"
      >
        <span className="text-left text-white font-medium">{question}</span>
        <ChevronDown
          size={20}
          className={`text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-slate-900/50 border-t border-amber-500/20">
          <p className="text-amber-100 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

import React from 'react';
