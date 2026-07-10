import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Payment Terms | GST Tax Wale',
  description: 'Understand the payment methods, security, and terms for services offered by GST Tax Wale.',
};

export default function PaymentTerms() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Terms &amp; Conditions</h1>
        <p className="text-gray-500 text-sm">Last updated: June 26, 2026</p>
        
      </section>

      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-700 space-y-8 pb-16">

        <PolicySection title="1. Accepted Payment Methods">
          <p className="mb-3">We accept the following payment options:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '💳', label: 'Credit Cards', detail: 'Visa, Mastercard, Amex, RuPay' },
              { icon: '🏧', label: 'Debit Cards', detail: 'All major Indian bank debit cards' },
              { icon: '📱', label: 'UPI', detail: 'GPay, PhonePe, Paytm, BHIM, WhatsApp Pay' },
              { icon: '🏦', label: 'Net Banking', detail: 'All major Indian banks' },
              { icon: '👛', label: 'Wallets', detail: 'Paytm, Mobikwik, Amazon Pay' },
            ].map(m => (
              <div key={m.label} className="flex items-start gap-3 border border-gray-100 rounded-lg p-3">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{m.label}</p>
                  <p className="text-gray-500 text-xs">{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </PolicySection>

        <PolicySection title="2. Currency & Pricing">
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>All prices are displayed and charged in <strong>Indian Rupees (INR)</strong></li>
            <li>GST (18%) is included in the displayed price where applicable</li>
            <li>No hidden charges — final amount shown at checkout is what you pay</li>
            <li>Payment gateway charges are absorbed by GST Tax Wale (not passed to customers)</li>
            <li>Prices are subject to change; rate at time of purchase applies</li>
          </ul>
        </PolicySection>

        <PolicySection title="3. Payment Security">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-semibold text-sm mb-2">🔒 Your payment is 100% secure</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-700 ml-2">
              <li>256-bit SSL encryption on all transactions</li>
              <li>PCI-DSS Level 1 compliant (highest level)</li>
              <li>Card details are never stored on our servers</li>
              <li>3D Secure authentication supported</li>
              <li>Real-time fraud monitoring systems</li>
            </ul>
          </div>
        </PolicySection>

        <PolicySection title="4. After Successful Payment">
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>You will receive an instant payment confirmation email</li>
            <li>GST Tax Wale will send a service activation email within 15 minutes</li>
            <li>Transaction ID and invoice available in your account dashboard immediately</li>
            <li>PDF invoice can be downloaded for tax/accounting records</li>
          </ul>
        </PolicySection>

        <PolicySection title="5. Failed Payments">
          <p className="mb-3">If your payment fails:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>No amount will be charged to your account (bank may show a temporary hold that is auto-reversed)</li>
            <li>You will see an error message with a reason for failure</li>
            <li>You may retry immediately with the same or a different payment method</li>
            <li>If your bank debits the amount but order is not confirmed, contact us within 24 hours</li>
          </ul>
          <p className="mt-3 text-sm">
            Contact: <a href="mailto:help@gsttaxwale.com" className="text-blue-600 hover:underline">help@gsttaxwale.com</a>
          </p>
        </PolicySection>

        <PolicySection title="6. Refunds">
          <p>
            Refunds are processed as per our{' '}
            <Link href="/refund-policy" className="text-blue-600 hover:underline font-medium">
              Refund &amp; Cancellation Policy
            </Link>
            . All approved refunds are credited back to the original payment method within the
            applicable timeframe.
          </p>
        </PolicySection>

        <PolicySection title="7. Promotional Codes & Discounts">
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Promo codes are valid for the specified period only</li>
            <li>Codes cannot be combined unless explicitly stated</li>
            <li>Services purchased with discount codes are generally non-refundable</li>
            <li>GST Tax Wale reserves the right to withdraw or modify offers without prior notice</li>
          </ul>
        </PolicySection>

        <PolicySection title="8. Dispute Resolution">
          <p>
            For any payment disputes, please contact us at <strong>help@gsttaxwale.com</strong> before
            raising a chargeback with your bank. We aim to resolve all disputes within <strong>2 business days</strong>.
            
          </p>
        </PolicySection>

        <PolicySection title="9. Contact Us">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-2 text-sm">
            <p><strong>Email:</strong> help@gsttaxwale.com</p>
            <p><strong>Phone:</strong> +91-7870778771 | +91-6182313455</p>
            <p><strong>Business Hours:</strong> Monday – Saturday, 9 AM – 6 PM IST</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/refund-policy" className="text-blue-600 hover:underline">Refund Policy →</Link>
            <Link href="/shipping-policy" className="text-blue-600 hover:underline">Service Delivery Policy →</Link>
            <Link href="/terms" className="text-blue-600 hover:underline">Terms &amp; Conditions →</Link>
          </div>
        </PolicySection>
      </section>
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-blue-700 mb-3 border-b border-blue-100 pb-2">{title}</h2>
      <div className="text-gray-700 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}
