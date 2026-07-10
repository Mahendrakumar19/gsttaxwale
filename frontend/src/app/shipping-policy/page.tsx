import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Service Delivery Policy | GST Tax Wale',
  description: 'Learn how GST Tax Wale delivers its digital tax services — timelines, methods, and service activation details.',
};

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Service Delivery Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: June 26, 2026</p>
        <p className="text-gray-600 mt-3 text-sm">
          GST Tax Wale offers <strong>100% digital services</strong>. There is no physical shipping.
          All services are delivered electronically to your registered email address and through your
          secure account dashboard.
        </p>
      </section>

      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-700 space-y-8 pb-16">

        <PolicySection title="1. Nature of Services">
          <p>
            All services provided by GST Tax Wale are entirely <strong>digital in nature</strong> and include:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
            <li>GST registration, filing, and compliance</li>
            <li>Income Tax Return (ITR) filing</li>
            <li>TDS filing and compliance</li>
            <li>Company/LLP registration</li>
            <li>Professional CA consultations (video/phone/chat)</li>
            <li>Document preparation and submission</li>
          </ul>
          <p className="mt-3">
            Since all services are delivered digitally, there are no shipping charges. The &quot;delivery&quot;
            of a service refers to completion and communication of results to the customer.
          </p>
        </PolicySection>

        <PolicySection title="2. Service Delivery Timelines">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm mt-2">
              <thead>
                <tr className="bg-blue-50 text-gray-900">
                  <th className="border border-blue-100 px-4 py-2 text-left">Service Type</th>
                  <th className="border border-blue-100 px-4 py-2 text-left">Typical Delivery Time</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-100 px-4 py-2">Instant Access / Templates / Downloads</td><td className="border border-gray-100 px-4 py-2">Immediately after payment</td></tr>
                <tr><td className="border border-gray-100 px-4 py-2">GST Return Filing (GSTR-1 / GSTR-3B)</td><td className="border border-gray-100 px-4 py-2">Within 24–48 hours of document submission</td></tr>
                <tr><td className="border border-gray-100 px-4 py-2">ITR Filing (Individual)</td><td className="border border-gray-100 px-4 py-2">Within 3–5 business days</td></tr>
                <tr><td className="border border-gray-100 px-4 py-2">Business Tax Filing / TDS</td><td className="border border-gray-100 px-4 py-2">Within 3–7 business days</td></tr>
                <tr><td className="border border-gray-100 px-4 py-2">GST / Company Registration</td><td className="border border-gray-100 px-4 py-2">5–15 business days (subject to govt. processing)</td></tr>
                <tr><td className="border border-gray-100 px-4 py-2">Expert Consultation</td><td className="border border-gray-100 px-4 py-2">Scheduled within 24 hours of booking</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            * Timelines are estimates and begin only after the customer submits all required documents.
            Government portal delays are outside our control.
          </p>
        </PolicySection>

        <PolicySection title="3. How We Deliver Services">
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Email:</strong> Filed returns, acknowledgements, and reports sent to your registered email</li>
            <li><strong>Account Dashboard:</strong> All documents available under Dashboard → Documents &amp; Downloads</li>
            <li><strong>WhatsApp / SMS:</strong> Status updates and important notifications</li>
            <li><strong>In-App Notifications:</strong> Real-time updates within your account</li>
          </ul>
        </PolicySection>

        <PolicySection title="4. What Happens After Payment">
          <ol className="list-decimal list-inside space-y-2 ml-2">
            
            <li>GST Tax Wale sends a service activation confirmation within 15 minutes</li>
            <li>A case manager is assigned to your order within 1 business day</li>
            <li>You will be contacted for any additional documents required</li>
            <li>Service status is updated in real-time in your dashboard</li>
            <li>Completion notification sent once the service is delivered</li>
          </ol>
        </PolicySection>

        <PolicySection title="5. Delayed Delivery">
          <p className="mb-2">
            If delivery is delayed beyond the stated timeline for reasons within our control:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Contact us at <strong>help@gsttaxwale.com</strong> with your Order ID</li>
            <li>We will investigate and provide an update within 12 hours</li>
            <li>In case of significant delay, a partial refund or service upgrade may be offered</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">
            Note: Delays caused by government portal downtime, incorrect/incomplete documents provided by the customer,
            or force majeure events are not eligible for compensation.
          </p>
        </PolicySection>

        <PolicySection title="6. Document Retention">
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>All filed documents are stored in your dashboard for a minimum of 3 years</li>
            <li>You may download your documents at any time from Dashboard → Downloads</li>
            <li>Re-delivery of documents available free of cost by contacting support</li>
          </ul>
        </PolicySection>

        <PolicySection title="7. Contact Us">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-2 text-sm">
            <p><strong>Email:</strong> help@gsttaxwale.com</p>
            <p><strong>Phone:</strong> +91-7870778771 | +91-6182313455</p>
            <p><strong>Business Hours:</strong> Monday – Saturday, 9 AM – 6 PM IST</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/refund-policy" className="text-blue-600 hover:underline">Refund Policy →</Link>
            <Link href="/payment-terms" className="text-blue-600 hover:underline">Payment Terms →</Link>
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
