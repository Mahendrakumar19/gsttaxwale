'use client';

export default function PaymentTerms() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Terms & Conditions</h1>
        <p className="text-gray-600">Last updated: May 2, 2026</p>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-700 space-y-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Payment Methods</h2>
            <p className="mb-3">We accept the following payment methods through Razorpay:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-gray-900">Credit Cards:</strong> Visa, Mastercard, American Express, Rupay</li>
              <li><strong className="text-gray-900">Debit Cards:</strong> All major Indian banks</li>
              <li><strong className="text-gray-900">UPI:</strong> Google Pay, PhonePe, Paytm, WhatsApp Pay</li>
              <li><strong className="text-gray-900">Digital Wallets:</strong> Paytm, Mobikwik, Amazon Pay</li>
              <li><strong className="text-gray-900">Net Banking:</strong> All major Indian banks</li>
              <li><strong className="text-gray-900">BNPL Services:</strong> Razorpay BNPL partners</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Payment Processing</h2>
            <p className="mb-3">Payment processing details:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>All payments are processed securely through Razorpay</li>
              <li>Payment confirmation is instant upon successful transaction</li>
              <li>Confirmation email is sent within 5 minutes of payment</li>
              <li>Failed payments: You will be prompted to retry with alternate method</li>
              <li>Transaction ID and receipt available in your account dashboard</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Pricing & Taxes</h2>
            <p className="mb-3">Please note the following regarding pricing:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>All prices are displayed in Indian Rupees (INR)</li>
              <li>GST (18%) is included in the final price where applicable</li>
              <li>Applicable taxes are shown before checkout</li>
              <li>No hidden charges beyond the displayed amount</li>
              <li>Payment gateway charges are covered by GST Tax Wale (no additional cost to you)</li>
              <li>International payments: Currency conversion by your bank/payment provider applies</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Promotional Codes & Discounts</h2>
            <p className="mb-3">Terms for using promotional codes:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Discounts and promotional codes are valid for specified period only</li>
              <li>Each code has specific terms (minimum purchase, category restrictions, etc.)</li>
              <li>Codes cannot be combined unless explicitly stated</li>
              <li>Services purchased with promotional discounts are non-refundable/non-exchangeable</li>
              <li>GST Tax Wale reserves the right to cancel codes due to misuse</li>
              <li>Discounts are non-transferable and cannot be redeemed for cash</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Failed Payment Handling</h2>
            <p className="mb-3">If your payment fails:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>You will see an error message with the reason for failure</li>
              <li>No amount will be deducted from your account</li>
              <li>You can retry immediately with the same or different payment method</li>
              <li>Keep your bank/card company informed if you see multiple failed attempts</li>
              <li>Contact support if the issue persists: help@gsttaxwale.com</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Duplicate Charge Policy</h2>
            <p className="mb-3">If you were charged multiple times:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Contact support immediately at help@gsttaxwale.com</li>
              <li>Provide your Order IDs and transaction details</li>
              <li>We will refund the duplicate charge(s) within 24 hours</li>
              <li>Refund will be processed to your original payment method</li>
              <li>You will receive confirmation email after refund initiation</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Invoice & Tax Certificate</h2>
            <p className="mb-3">Invoices and tax documentation:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Invoice is available in your account dashboard immediately after payment</li>
              <li>PDF invoice can be downloaded for accounting records</li>
              <li>GST invoice is provided for registered business customers</li>
              <li>Invoice contains: Order ID, service details, amount, GST amount, tax ID</li>
              <li>Duplicate invoices available on request (help@gsttaxwale.com)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Payment Security</h2>
            <p className="mb-3">Your payment security:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>All transactions are encrypted with SSL/TLS encryption</li>
              <li>PCI-DSS compliant payment processing</li>
              <li>Card details are never stored on our servers</li>
              <li>Payment processed through Razorpay's secure gateway</li>
              <li>Two-factor authentication available for UPI and wallet payments</li>
              <li>Fraud detection system monitors all transactions</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Subscription & Recurring Payments</h2>
            <p className="mb-3">For subscription-based services:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Recurring charges will be processed on the same day each month/year</li>
              <li>You will receive a reminder email 7 days before each renewal</li>
              <li>Automatic cancellation available in account settings anytime</li>
              <li>Cancellation takes effect immediately; no charges after cancellation</li>
              <li>No refunds for partial months/years of subscription</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Currency & Exchange Rates</h2>
            <p className="mb-3">International payment considerations:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>All payments must be in Indian Rupees (INR)</li>
              <li>Exchange rates are determined by your bank or payment provider</li>
              <li>GST Tax Wale is not responsible for forex fluctuations</li>
              <li>International transaction fees charged by your bank apply</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Contact Information</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
              <p><strong className="text-gray-900">For Payment Issues:</strong> help@gsttaxwale.com</p>
              <p><strong className="text-gray-900">Phone:</strong> +91-XXXXXXXXXX</p>
              <p><strong className="text-gray-900">Payment Gateway Support:</strong> Razorpay (support@razorpay.com)</p>
              <p><strong className="text-gray-900">Response Time:</strong> Within 2 hours during business hours</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
