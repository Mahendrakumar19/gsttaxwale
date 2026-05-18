'use client';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Disclaimer</h1>
        <p className="text-gray-600">Last updated: May 18, 2026</p>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-700 space-y-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <p className="text-amber-900 font-semibold">
            ⚠️ Please read this disclaimer carefully before using GST Tax Wale services. By accessing and using our platform, you acknowledge and accept all the terms outlined below.
          </p>
        </div>

        <div className="space-y-8">

          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. About Our Services</h2>
            <p className="mb-3">
              GST Tax Wale provides professional tax, GST, and compliance services through qualified Chartered Accountants (CAs) and tax professionals. We assist users with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>GST filings and registrations</li>
              <li>Income tax return preparation and filing</li>
              <li>Compliance notices and responses</li>
              <li>Bookkeeping and accounting services</li>
              <li>Related statutory and compliance services</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. User Responsibility</h2>
            <p className="mb-3">
              While we strive to provide accurate and timely services, users remain responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Reviewing all information, documents, and filings before final submission to government authorities</li>
              <li>Providing accurate and complete data to our team</li>
              <li>Ensuring their financial records are up-to-date and verifiable</li>
              <li>Informing us promptly of any changes in their business, income, or compliance status</li>
              <li>Keeping login credentials and shared documents confidential and secure</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Independence from Government Authorities</h2>
            <p className="mb-3">
              GST Tax Wale is an independent private service provider and is <strong>not affiliated with, endorsed by, or operated by</strong> the Government of India, GSTN, Income Tax Department, or any government authority.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>We are not an official government website or portal</li>
              <li>Our name, branding, and communications carry no government authority</li>
              <li>We do not represent or act on behalf of any regulatory body</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Government Processing & Outcomes</h2>
            <p className="mb-3">
              Acceptance, approval, refunds, assessments, and processing timelines are solely determined by the respective government departments and authorities. GST Tax Wale:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Cannot guarantee acceptance of filed returns or applications by tax authorities</li>
              <li>Is not responsible for government processing delays or system downtime</li>
              <li>Cannot influence or control the outcome of assessments, notices, or refunds</li>
              <li>Is not liable for penalties arising from government decisions made independent of our services</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Accuracy of Information</h2>
            <p className="mb-3">
              While our qualified professionals work diligently to ensure accuracy:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Tax laws and regulations change frequently and without prior notice</li>
              <li>Users should verify final filings and documents before authorizing submission</li>
              <li>We recommend cross-referencing critical matters with official government sources</li>
              <li>Our team updates practices in accordance with the latest applicable rules and circulars</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p className="mb-3">
              GST Tax Wale is not liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Losses arising from inaccurate or incomplete information provided by the user</li>
              <li>Penalties or interest due to government-imposed delays or policy changes</li>
              <li>Losses caused by unauthorized access to user accounts</li>
              <li>Indirect, incidental, or consequential damages arising from use of our services</li>
              <li>Service disruptions caused by government portals (GSTN, IT e-filing, etc.) or third-party platforms</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Data Security</h2>
            <p className="mb-3">
              We implement industry-standard security measures to protect your data. However:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>No system is 100% immune to security threats</li>
              <li>Users transmit data over the internet at their own risk</li>
              <li>We are not liable for unauthorized access resulting from user negligence (e.g., sharing passwords)</li>
              <li>We recommend not sharing sensitive credentials with anyone, including our team, beyond what is strictly necessary</li>
            </ul>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Service Availability</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Our platform may be intermittently unavailable due to maintenance or technical issues</li>
              <li>We do not guarantee 100% uptime of the web portal</li>
              <li>Time-sensitive compliance filings should not be left to the last minute</li>
              <li>We are not liable for losses caused by platform downtime or technical interruptions</li>
            </ul>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Jurisdiction & Governing Law</h2>
            <p className="mb-3">
              This disclaimer is governed by the laws of India. Any disputes arising from the use of our services shall be subject to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Exclusive jurisdiction of competent courts in India</li>
              <li>Resolution through good-faith negotiation before legal proceedings</li>
            </ul>
          </div>

          {/* Section 10 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Changes to This Disclaimer</h2>
            <p>
              We reserve the right to update this disclaimer at any time to reflect changes in our services, applicable laws, or best practices. Continued use of our services after any update constitutes your acceptance of the revised disclaimer.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Contact & Grievances</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
              <p><strong className="text-gray-900">For Disclaimer Clarifications:</strong> help@gsttaxwale.com</p>
              <p><strong className="text-gray-900">Phone:</strong> +91-7870778771 | +91-6182313455</p>
              <p><strong className="text-gray-900">Office Hours:</strong> Monday – Saturday, 10 AM – 6 PM IST</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
