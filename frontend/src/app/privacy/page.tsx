'use client';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: April 1, 2026</p>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-700 space-y-8">
        <ContentSection title="1. Introduction">
          GST Tax Wale ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
        </ContentSection>

        <ContentSection title="2. Information We Collect">
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-gray-900">Personal Information:</strong> Name, email, phone number, PAN, Aadhar, business details</li>
            <li><strong className="text-gray-900">Financial Information:</strong> Bank account details (for filing purposes only)</li>
            <li><strong className="text-gray-900">Tax Information:</strong> Income documents, GST records, business expenses</li>
            <li><strong className="text-gray-900">Usage Data:</strong> Pages visited, time spent, device information, IP address</li>
            <li><strong className="text-gray-900">Cookies:</strong> To improve user experience and remember preferences</li>
          </ul>
        </ContentSection>

        <ContentSection title="3. How We Use Your Information">
          <ul className="list-disc list-inside space-y-2">
            <li>Process your tax filings and compliance requirements</li>
            <li>Send important deadline reminders and compliance updates</li>
            <li>Communicate with you about our services</li>
            <li>Improve our platform based on user behavior</li>
            <li>Comply with legal and regulatory requirements</li>
            <li>Generate reports and analytics (anonymized)</li>
          </ul>
        </ContentSection>

        <ContentSection title="4. Data Security">
          We implement bank-level SSL encryption and security measures to protect your data. Your information is:
          <ul className="list-disc list-inside space-y-2">
            <li>Encrypted in transit and at rest</li>
            <li>Stored on secure servers with firewalls</li>
            <li>Backed up regularly to prevent loss</li>
            <li>Access restricted to authorized employees only</li>
            <li>Protected by 2-factor authentication</li>
          </ul>
        </ContentSection>

        <ContentSection title="5. Sharing Your Information">
          We do NOT share your personal information except:
          <ul className="list-disc list-inside space-y-2">
            <li>With government agencies as legally required (GST, Income Tax departments)</li>
            <li>With payment gateways for processing transactions (encrypted)</li>
            <li>With legal authorities when compelled by law</li>
            <li>With your explicit consent for third-party services</li>
          </ul>
        </ContentSection>

        <ContentSection title="6. Your Rights">
          You have the right to:
          <ul className="list-disc list-inside space-y-2">
            <li>Access all your personal data</li>
            <li>Download/export your data anytime</li>
            <li>Request deletion of your account</li>
            <li>Opt-out of marketing communications</li>
            <li>Lodge a complaint with data protection authorities</li>
          </ul>
        </ContentSection>

        <ContentSection title="7. Cookies Policy">
          We use cookies for:
          <ul className="list-disc list-inside space-y-2">
            <li>Keeping you logged in</li>
            <li>Remembering preferences</li>
            <li>Tracking website analytics</li>
            <li>Personalizing user experience</li>
          </ul>
          You can disable cookies in your browser settings, but some features may not work properly.
        </ContentSection>

        <ContentSection title="8. Third-Party Links">
          Our website may contain links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies independently.
        </ContentSection>

        <ContentSection title="9. Children's Privacy">
          Our services are not directed to children under 18. If we become aware that a child has provided us with personal information, we will promptly delete it.
        </ContentSection>

        <ContentSection title="10. Changes to This Policy">
          We may update this Privacy Policy periodically. Changes will be posted on this page with an updated date. Your continued use of the website constitutes acceptance of changes.
        </ContentSection>

        <ContentSection title="11. Contact Us">
          For privacy concerns or requests, contact us at:
          <div className="mt-4 p-4 bg-slate-800/50 border border-amber-500/30 rounded-lg">
            <p><strong className="text-gray-900">Email:</strong> privacy@gsttaxwale.com</p>
            <p><strong className="text-gray-900">Address:</strong> GST Tax Wale, India</p>
            <p><strong className="text-gray-900">WhatsApp:</strong> +91-9999-999-999</p>
          </div>
        </ContentSection>
      </section>
    </div>
  );
}

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-600 mb-4">{title}</h2>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}
