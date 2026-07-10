import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Refund & Cancellation Policy | GST Tax Wale',
  description: 'Read the complete Refund and Cancellation Policy of GST Tax Wale. Understand refund timelines, eligibility and process.',
};

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund &amp; Cancellation Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: June 26, 2026</p>
        <p className="text-gray-600 mt-3 text-sm">
          This Refund &amp; Cancellation Policy applies to all services offered by{' '}
          <strong>GST Tax Wale</strong>
        </p>
      </section>

      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-700 space-y-8 pb-16">

        <PolicySection title="1. Overview">
          <p>
            GST Tax Wale (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to providing quality
            professional tax services. We understand that circumstances may require cancellations or refunds and have
            established this policy to be fair to both our clients and our team.
          </p>
          <p className="mt-3">
            By making a purchase on our platform, you agree to the terms of this refund policy.
          </p>
        </PolicySection>

        <PolicySection title="2. Eligibility for Refunds">
          <p className="mb-3">Refunds are available under the following conditions:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong>Full Refund (100%):</strong> Service cancelled within 24 hours of purchase and
              work has not yet been initiated by our team.
            </li>
            <li>
              <strong>Partial Refund:</strong> Service is in progress — refund calculated on a pro-rata basis
              for the work not yet completed.
            </li>
            <li>
              <strong>No Refund:</strong> Service has been fully delivered or completed, unless there is
              a provable service guarantee clause violation.
            </li>
            <li>
              <strong>Duplicate Payments:</strong> 100% refund for any duplicate/double charge within
              24 hours of reporting.
            </li>
            <li>
              <strong>Failed Payment — Amount Debited:</strong> If your bank deducted amount but the order
              was not confirmed, we will refund the full amount within 5–7 business days.
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="3. Non-Refundable Services">
          <p className="mb-3">The following are NOT eligible for refunds:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Services where documents or filing reports have already been delivered</li>
            <li>Consultation sessions that have already been conducted</li>
            <li>Services purchased using promotional or referral discount codes</li>
            <li>Bundle packages where any service within the bundle has been initiated</li>
            <li>Renewal charges for ongoing compliance subscriptions (after renewal date)</li>
            <li>Government fee components (if applicable) that have been remitted</li>
          </ul>
        </PolicySection>

        <PolicySection title="4. How to Request a Refund">
          <p className="mb-3">To initiate a cancellation or refund request:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Log in to your account and go to <strong>Dashboard → Orders</strong></li>
            <li>Select the service order you wish to cancel</li>
            <li>Click <strong>&quot;Request Cancellation&quot;</strong> and provide a reason</li>
            <li>Alternatively, email us at <strong>help@gsttaxwale.com</strong> with your Order ID</li>
            <li>Our team will review and respond within <strong>1–2 business days</strong></li>
            <li>Approved refunds are processed within <strong>5–7 business days</strong></li>
          </ol>
        </PolicySection>

        <PolicySection title="5. Refund Processing Timeline">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm mt-2">
              <thead>
                <tr className="bg-blue-50 text-gray-900">
                  <th className="border border-blue-100 px-4 py-2 text-left">Payment Method</th>
                  <th className="border border-blue-100 px-4 py-2 text-left">Refund Timeline</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-100 px-4 py-2">Credit / Debit Card</td><td className="border border-gray-100 px-4 py-2">5–7 business days</td></tr>
                <tr><td className="border border-gray-100 px-4 py-2">UPI (GPay, PhonePe, Paytm)</td><td className="border border-gray-100 px-4 py-2">1–3 business days</td></tr>
                <tr><td className="border border-gray-100 px-4 py-2">Net Banking</td><td className="border border-gray-100 px-4 py-2">5–7 business days</td></tr>
                <tr><td className="border border-gray-100 px-4 py-2">Digital Wallets</td><td className="border border-gray-100 px-4 py-2">1–2 business days</td></tr>
                <tr><td className="border border-gray-100 px-4 py-2">NEFT / RTGS / Bank Transfer</td><td className="border border-gray-100 px-4 py-2">7–10 business days</td></tr>
              </tbody>
            </table>
          </div>
          
        </PolicySection>

        <PolicySection title="6. Exceptions & Special Cases">
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Refunds are NOT issued for delays caused by the customer (e.g., late document submission)</li>
            <li>Refunds will be credited to the <strong>original payment source only</strong></li>
            <li>Cash refunds are not possible under any circumstances</li>
            <li>Services accessed after purchase do not qualify for full refunds</li>
          </ul>
        </PolicySection>

        <PolicySection title="7. Chargebacks">
          <p>
            If you initiate a chargeback with your bank without first contacting us, we reserve the right to
            suspend your account and contest the chargeback. Please always reach out to us first at{' '}
            <strong>help@gsttaxwale.com</strong> — we resolve most disputes amicably and promptly.
          </p>
        </PolicySection>

        <PolicySection title="8. Contact Us">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-2 text-sm">
            <p><strong>Email:</strong> help@gsttaxwale.com</p>
            <p><strong>Phone:</strong> +91-7870778771 | +91-6182313455</p>
            <p><strong>Business Hours:</strong> Monday – Saturday, 10 AM – 6 PM IST</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/payment-terms" className="text-blue-600 hover:underline">Payment Terms →</Link>
            <Link href="/shipping-policy" className="text-blue-600 hover:underline">Service Delivery Policy →</Link>
            <Link href="/contact" className="text-blue-600 hover:underline">Contact Us →</Link>
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
