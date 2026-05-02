'use client';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund & Cancellation Policy</h1>
        <p className="text-gray-600">Last updated: May 2, 2026</p>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-700 space-y-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Refund Policy</h2>
            <p className="mb-3">GST Tax Wale offers refunds under the following conditions:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-gray-900">Service Not Started:</strong> If you cancel within 24 hours of purchase and the service has not been initiated, you will receive a full refund (100%).</li>
              <li><strong className="text-gray-900">Service In Progress:</strong> Partial refunds are available for services in progress, calculated on a pro-rata basis.</li>
              <li><strong className="text-gray-900">Service Completed:</strong> No refunds are offered for completed services unless there is a specific service failure or guarantee clause violation.</li>
              <li><strong className="text-gray-900">Processing Time:</strong> All refunds will be processed within 7-10 business days to the original payment method.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Non-Refundable Services</h2>
            <p className="mb-3">The following services are generally non-refundable:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Documents or reports generated after payment confirmation</li>
              <li>Services where deliverables have been provided</li>
              <li>Consultation services after the session has been scheduled</li>
              <li>Services paid via promotional codes or discounts (non-transferable)</li>
              <li>Bundle packages after initiation of any service within the bundle</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Cancellation Process</h2>
            <p className="mb-3">To cancel your service and request a refund:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Log in to your account and navigate to "Orders" or "My Services"</li>
              <li>Select the service you wish to cancel</li>
              <li>Click the "Cancel Service" button</li>
              <li>Provide a reason for cancellation (optional)</li>
              <li>Submit the cancellation request</li>
              <li>You will receive a refund confirmation email within 24 hours</li>
              <li>The refund will be credited within 7-10 business days</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Exceptions & Special Cases</h2>
            <p className="mb-3">Refunds may be denied or adjusted in the following cases:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Payment made through fraudulent or unauthorized means</li>
              <li>Services accessed after payment but before requesting cancellation</li>
              <li>Duplicate payments (refund of the extra amount only)</li>
              <li>Technical issues caused by the customer's internet connection or device</li>
              <li>Misuse of refund policy for repeated cancellations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Grievance Redressal</h2>
            <p className="mb-3">If you believe you are entitled to a refund that was denied:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Contact our support team at <strong className="text-gray-900">help@gsttaxwale.com</strong></li>
              <li>Provide your Order ID and reason for dispute</li>
              <li>Include supporting documentation if applicable</li>
              <li>Our team will review and respond within 5-7 business days</li>
              <li>If unresolved, you may escalate to our management committee</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Payment Method Considerations</h2>
            <p className="mb-3">Refund method depends on your original payment method:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-gray-900">Credit/Debit Card:</strong> Refund credited to the same card (2-5 business days)</li>
              <li><strong className="text-gray-900">UPI:</strong> Refund to registered UPI account (instant to 2 business days)</li>
              <li><strong className="text-gray-900">Wallet:</strong> Refund to account wallet (instant)</li>
              <li><strong className="text-gray-900">Bank Transfer:</strong> Refund to registered bank account (7-10 business days)</li>
              <li>Your bank/financial institution may take additional time to reflect the amount</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Modification of Policy</h2>
            <p className="mb-3">
              GST Tax Wale reserves the right to modify this refund policy at any time. Changes will be effective immediately upon posting to the website. Your continued use of our services indicates acceptance of the modified policy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Contact Information</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
              <p><strong className="text-gray-900">Email:</strong> help@gsttaxwale.com</p>
              <p><strong className="text-gray-900">Phone:</strong> +91-XXXXXXXXXX</p>
              <p><strong className="text-gray-900">Address:</strong> GST Tax Wale, India</p>
              <p><strong className="text-gray-900">Business Hours:</strong> Monday - Friday, 9 AM - 6 PM IST</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
