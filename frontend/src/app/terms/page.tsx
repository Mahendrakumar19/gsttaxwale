'use client';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-gray-600">Last updated: April 1, 2026</p>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-700 space-y-8">
        <ContentSection title="1. Acceptance of Terms">
          By accessing and using GST Tax Wale website and services, you accept and agree to be bound by the terms and conditions outlined in this agreement.
        </ContentSection>

        <ContentSection title="2. Use License">
          Permission is granted to temporarily download one copy of the materials (information or software) on GST Tax Wale website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          <ul className="list-disc list-inside space-y-2 mt-3">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to reverse engineer any software contained on the website</li>
            <li>Remove any copyright or other proprietary notations</li>
            <li>Transfer the materials to another person or "mirror" the materials on another server</li>
          </ul>
        </ContentSection>

        <ContentSection title="3. Disclaimer">
          The materials on GST Tax Wale are provided on an 'as is' basis. GST Tax Wale makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </ContentSection>

        <ContentSection title="4. Limitations">
          In no event shall GST Tax Wale or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GST Tax Wale's website.
        </ContentSection>

        <ContentSection title="5. Accuracy of Materials">
          The materials appearing on GST Tax Wale website could include technical, typographical, or photographic errors. GST Tax Wale does not warrant that any of the materials on our website are accurate, complete, or current. We may make changes to the materials on our website at any time without notice.
        </ContentSection>

        <ContentSection title="6. Links">
          GST Tax Wale has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by GST Tax Wale of the site. Use of any such linked website is at the user's own risk.
        </ContentSection>

        <ContentSection title="7. Modifications">
          GST Tax Wale may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
        </ContentSection>

        <ContentSection title="8. Governing Law">
          These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts located in India.
        </ContentSection>

        <ContentSection title="9. Limitation of Liability">
          Notwithstanding any damages that you might incur, the entire liability of GST Tax Wale and any of its suppliers shall be limited to the amount you actually paid to us for services provided through the website.
        </ContentSection>

        <ContentSection title="10. Tax Services Disclaimer">
          <ul className="list-disc list-inside space-y-2">
            <li>GST Tax Wale provides tax filing, GST, and compliance services based on information provided by the client</li>
            <li>We recommend consulting with a CA or tax professional for complex scenarios</li>
            <li>We are not liable for incorrect information provided by clients</li>
            <li>Final filing authority rests with tax departments, not GST Tax Wale</li>
            <li>Penalties or rejections by tax authorities are client's responsibility</li>
          </ul>
        </ContentSection>

        <ContentSection title="11. Payment Terms">
          <ul className="list-disc list-inside space-y-2">
            <li>Payment is due before service delivery</li>
            <li>GST Tax Wale offers no-refund policy after services are rendered</li>
            <li>For incomplete services, partial refunds may be considered</li>
            <li>All prices are in Indian Rupees and subject to applicable taxes</li>
          </ul>
        </ContentSection>

        <ContentSection title="12. User Conduct">
          You agree not to:
          <ul className="list-disc list-inside space-y-2 mt-3">
            <li>Harass or cause distress or inconvenience to any person</li>
            <li>Transmit obscene, offensive or indecent images, sounds or messages</li>
            <li>Disrupt the normal flow of dialogue within our platforms</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Engage in commercial activities without permission</li>
          </ul>
        </ContentSection>

        <ContentSection title="13. Contact Information">
          For questions about these Terms & Conditions:
          <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
            <p><strong className="text-gray-900">Email:</strong> help@gsttaxwale.com</p>
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
