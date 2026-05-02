'use client';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Service Delivery Policy</h1>
        <p className="text-gray-600">Last updated: May 2, 2026</p>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-700 space-y-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Service Delivery Timeline</h2>
            <p className="mb-3">All services are delivered digitally within the specified timeframes:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-gray-900">Instant Services:</strong> Available immediately after payment confirmation (e.g., downloads, templates)</li>
              <li><strong className="text-gray-900">24-48 Hour Services:</strong> Delivered within 24-48 hours of purchase</li>
              <li><strong className="text-gray-900">Standard Services:</strong> Delivered within 3-5 business days</li>
              <li><strong className="text-gray-900">Premium Services:</strong> Delivered within 5-7 business days with personalized attention</li>
              <li>Timelines are estimates and may vary based on service complexity and workload</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Access to Services</h2>
            <p className="mb-3">After successful payment, you will:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Receive a confirmation email within 5 minutes</li>
              <li>Have immediate access to your account dashboard</li>
              <li>See the service details in "My Services" section</li>
              <li>Receive downloadable documents via email and dashboard</li>
              <li>Get access credentials for any account-based services</li>
              <li>Can access services 24/7 from any device with internet connection</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Digital Delivery Methods</h2>
            <p className="mb-3">Services are delivered through multiple channels:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-gray-900">Email Delivery:</strong> Documents sent to registered email address</li>
              <li><strong className="text-gray-900">Dashboard Access:</strong> Available in your account dashboard</li>
              <li><strong className="text-gray-900">Secure Portal:</strong> Login credentials provided for sensitive documents</li>
              <li><strong className="text-gray-900">Mobile App:</strong> Push notifications and in-app access (if applicable)</li>
              <li>All files are available for download for 1 year from the purchase date</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Service Activation</h2>
            <p className="mb-3">After payment confirmation:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Automatic activation: Most services activate immediately after successful payment</li>
              <li>Manual verification: Some services require admin verification (typically within 24 hours)</li>
              <li>Status updates: You will receive email notifications at each stage</li>
              <li>Access notification: Email confirmation when service is fully activated</li>
              <li>Support availability: 24/7 support for service-related queries</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Escalation for Delayed Delivery</h2>
            <p className="mb-3">If service delivery is delayed beyond the promised timeline:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Contact us immediately at help@gsttaxwale.com</li>
              <li>Provide your Order ID and service details</li>
              <li>We will investigate and provide updates within 24 hours</li>
              <li>In case of prolonged delay, partial refund or service upgrade may be offered</li>
              <li>No penalties are charged for delays caused by technical issues or natural circumstances</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Document Format & Compatibility</h2>
            <p className="mb-3">Documents are provided in the following formats:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-gray-900">PDF:</strong> Universal format for maximum compatibility</li>
              <li><strong className="text-gray-900">MS Word (.docx):</strong> For editable documents</li>
              <li><strong className="text-gray-900">Excel (.xlsx):</strong> For data and calculations</li>
              <li><strong className="text-gray-900">Images (.jpg, .png):</strong> High quality at 300 DPI</li>
              <li>Custom formats available upon request (may incur additional charges)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Re-download & Support</h2>
            <p className="mb-3">After delivery:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Documents can be downloaded multiple times without additional charges</li>
              <li>Free re-delivery to email if document is lost</li>
              <li>Support assistance for any technical issues with downloads</li>
              <li>Lifetime access to services in your account dashboard</li>
              <li>Updates and improvements to services are provided at no extra cost</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Responsibility Disclaimer</h2>
            <p className="mb-3">GST Tax Wale is not responsible for:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Non-receipt of emails due to spam filters or email provider issues</li>
              <li>Data loss on customer's devices after download</li>
              <li>Non-compliance with legal/regulatory changes after delivery</li>
              <li>Delays due to third-party payment processors (banks, Razorpay, etc.)</li>
              <li>Server downtime beyond our control (ISP issues, natural disasters, etc.)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Contact Support</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
              <p><strong className="text-gray-900">Email:</strong> help@gsttaxwale.com</p>
              <p><strong className="text-gray-900">Phone:</strong> +91-XXXXXXXXXX</p>
              <p><strong className="text-gray-900">Live Chat:</strong> Available in account dashboard</p>
              <p><strong className="text-gray-900">Response Time:</strong> Within 2 hours (Business hours)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
