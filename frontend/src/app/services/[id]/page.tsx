"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import fetchClient from '@/lib/fetchClient';
import { toast } from 'sonner';
import { Star, Check, Shield, Clock, Users, Award, ArrowLeft } from 'lucide-react';

// Mock services data - Match with services page
const MOCK_SERVICES = [
  { id: '1', slug: 'itr-filing-individual', title: 'Individual ITR Filing', price: 999, description: 'Professional Individual Income Tax Return filing with expert review', features: ['PAN validation', 'Income verification', 'E-filing submission', 'Expert CA review', 'ITR form selection', 'Deduction optimization'], benefits: ['Zero compliance errors', '24/7 support', 'Lifetime access', 'Amendment support'] },
  { id: '2', slug: 'gst-registration', title: 'GST Registration & Setup', price: 2499, description: 'Complete GST registration with document verification and portal training', features: ['Online registration', 'Document verification', 'Portal training', '30-day support', 'Business type consultation', 'Eligibility check'], benefits: ['Fast processing', 'Expert guidance', 'Document assistance', 'Post-registration support'] },
  { id: '3', slug: 'gst-filing-quarterly', title: 'GST Filing (Quarterly)', price: 1299, description: 'Quarterly GST return filing with input-output matching', features: ['GSTR-1 & GSTR-2 filing', 'Input-output match', 'Late fee calculation', 'Amendment support', 'Invoice reconciliation', 'HSN/SAC coding'], benefits: ['On-time filing', 'Error detection', 'Compliance assurance', 'Expert support'] },
  { id: '4', slug: 'gst-filing-annual', title: 'GST Annual Return (GSTR-9)', price: 1999, description: 'Annual GST return (GSTR-9) with complete reconciliation', features: ['Annual reconciliation', 'Audit trail preparation', 'Document compilation', 'Amendment support', 'ITC reconciliation', 'Advance tax planning'], benefits: ['Full year audit ready', 'Compliance certified', 'Liability reduction', 'Future planning'] },
  { id: '5', slug: 'tds-compliance', title: 'TDS Compliance & Filing', price: 1499, description: 'TDS calculation, filing, and quarterly compliance management', features: ['TDS calculation', 'Quarterly filing', 'Challan preparation', 'Outstanding TDS tracking', 'Deductee management', 'Monthly reconciliation'], benefits: ['Zero penalties', 'Automatic tracking', 'Expert consultation', 'Year-end reporting'] },
  { id: '6', slug: 'business-tax-consulting', title: 'Business Tax Consulting (2 hrs)', price: 4999, description: '2-hour personalized tax strategy session with expert CA', features: ['2-hour consultation', 'Personalized strategy', 'Document review', 'Action plan', 'Quarterly check-ins', 'Email support'], benefits: ['Custom solutions', 'Tax optimization', 'Growth planning', 'Ongoing support'] },
  { id: '7', slug: 'audit-support', title: 'Income Tax Audit Support', price: 7999, description: 'Complete support for income tax audit with defense strategy', features: ['Document compilation', 'Audit defense', 'Notice response', 'Follow-up support', 'Expert representation', 'Notice analysis'], benefits: ['Peace of mind', 'Professional defense', 'Fast resolution', 'Compliance assured'] },
  { id: '8', slug: 'startup-tax-setup', title: 'Startup Tax Setup Package', price: 9999, description: 'Complete tax setup for new startups with 6-month support', features: ['GST registration', 'PAN registration', 'Accounting setup', '6-month support', 'Compliance calendar', 'Investor documentation'], benefits: ['Investor ready', 'Compliant setup', 'Growth oriented', 'Dedicated support'] },
  { id: '9', slug: 'payroll-compliance', title: 'Monthly Payroll Compliance', price: 4999, description: 'Monthly payroll processing with statutory compliance', features: ['Salary processing', 'TDS filing', 'Statutory compliance', 'Employee reports', 'PF/ESI management', 'Attendance integration'], benefits: ['Employee satisfaction', 'Zero compliance issues', 'Automated processing', 'Monthly reporting'] },
  { id: '10', slug: 'investment-advisory', title: 'Tax Saving Investment Advisory', price: 2999, description: 'Personalized investment recommendations for tax savings', features: ['Income analysis', 'Investment recommendations', 'Tax saving strategies', 'Quarterly review', 'Portfolio optimization', 'Risk assessment'], benefits: ['Maximum tax savings', 'Smart investments', 'Growth planning', 'Expert guidance'] },
  { id: '11', slug: 'nri-tax-filing', title: 'NRI Income Tax Filing', price: 3999, description: 'Specialized NRI income tax return filing', features: ['NRI-specific ITR', 'Foreign asset filing', 'Remittance tracking', 'FATCA compliance', 'Dual taxation relief', 'FEMA compliance'], benefits: ['Complete compliance', 'Foreign income covered', 'Relief claimed', 'Expert NRI guidance'] },
  { id: '12', slug: 'professional-tax-filing', title: 'Professional Income Tax', price: 2499, description: 'Professional income tax return with deduction optimization', features: ['Professional deduction', 'Business expense analysis', 'Quarterly advance tax', 'Audit support', 'Deduction tracking', 'Income categorization'], benefits: ['Maximum deductions', 'Accurate filing', 'Audit ready', 'Year-round support'] },
  { id: '13', slug: 'capital-gains-planning', title: 'Capital Gains Tax Planning', price: 3499, description: 'Capital gains calculation and tax planning strategies', features: ['Gain calculation', 'Exemption planning', 'Loss offsetting', 'Investment recommendations', 'Timeline optimization', 'Reinvestment guidance'], benefits: ['Minimize tax', 'Optimize gains', 'Smart planning', 'Long-term benefit'] },
  { id: '14', slug: 'property-tax-setup', title: 'Property & Rental Tax Setup', price: 2999, description: 'Rental income documentation and annual ITR filing', features: ['Rental income tracking', 'Expense documentation', 'Depreciation calculation', 'Annual ITR filing', 'Deduction optimization', 'Property management support'], benefits: ['Rental income optimized', 'Expense maximized', 'Depreciation claimed', 'Audit ready'] },
  { id: '15', slug: 'tax-notice-response', title: 'Income Tax Notice Response', price: 5999, description: 'Expert response to income tax notices with full support', features: ['Notice analysis', 'Document compilation', 'Written response', 'Meeting support', 'Representation', 'Penalty mitigation'], benefits: ['Fast resolution', 'Expert defense', 'Penalty reduction', 'Peace of mind'] }
];

export default function ServiceDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in - check both sessionStorage and localStorage
    const token = sessionStorage.getItem('token') || localStorage.getItem('token') || localStorage.getItem('authToken');
    setIsLoggedIn(!!token);

    if (token) {
      // Fetch user details
      fetchClient
        .get('/api/auth/me')
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
          }
        })
        .catch((err) => console.log('Could not fetch user'));
    }

    // Find service from mock data or try to fetch
    let mounted = true;
    async function loadService() {
      try {
        // First check mock data
        const mockService = MOCK_SERVICES.find(s => s.id === id);
        if (mockService) {
          if (mounted) setService(mockService);
        } else {
          // Try to fetch from API
          const res = await fetchClient.get(`/api/services/${id}`);
          if (mounted && res.data?.service) {
            setService(res.data.service);
          }
        }
      } catch (err) {
        console.error('Failed to load service:', err);
        toast.error('Service not found');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadService();
    return () => { mounted = false; };
  }, [id]);

  const handlePurchaseNow = () => {
    if (!isLoggedIn) {
      // Redirect to login with return URL
      const returnUrl = `/checkout?serviceId=${id}`;
      router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else {
      // Go directly to checkout
      router.push(`/checkout?serviceId=${id}`);
    }

  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-lg text-gray-600">Loading service details…</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center text-gray-600">
          <p className="mb-2 text-lg font-semibold">Service not found</p>
          <button
            onClick={() => router.push('/services')}
            className="px-4 py-2 mt-4 text-white transition rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="px-4 py-4 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/services')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Services
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-blue-50 to-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
            {/* Left: Service Details */}
            <div>
              <div className="mb-6 inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                Service Details
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {service.title}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {service.description || `Professional ${service.title.toLowerCase()} services`}
              </p>

              {/* Price Section */}
              <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-sm text-gray-600">Starting at</span>
                  <div className="text-4xl font-bold text-blue-600">
                    ₹{service.price?.toLocaleString()}
                  </div>
                  <span className="text-gray-600">One-time payment</span>
                </div>
                <p className="text-sm text-gray-500">
                  No hidden charges. GST included.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handlePurchaseNow}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-600 transition shadow-lg"
                >
                  {isLoggedIn ? 'Purchase Now' : 'Login & Purchase'}
                </button>
                <button
                  onClick={() => router.push('/contact')}
                  className="px-8 py-4 border border-gray-300 text-gray-700 font-bold rounded-lg hover:border-blue-500 hover:text-blue-600 transition"
                >
                  Contact Support
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm">100% Secure Payment with Razorpay</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Instant Service Activation</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm">24/7 Customer Support</span>
                </div>
              </div>
            </div>

            {/* Right: Highlights */}
            <div className="flex flex-col gap-6">
              {/* Features Box */}
              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  What's Included
                </h3>
                <ul className="space-y-3">
                  {(service.features || [])?.slice(0, 5).map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits Box */}
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Key Benefits
                </h3>
                <ul className="space-y-3">
                  {(service.benefits || ['Expert support', 'Instant access', 'Lifetime updates', 'Full documentation']).map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold">→</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Features Section */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Complete Feature List</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(service.features || []).map((feature: string, i: number) => (
              <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="px-4 py-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg text-gray-900 mb-2">How long does the service take?</h3>
              <p className="text-gray-600">
                Most services are activated instantly after successful payment. Some services like consulting may take 24-48 hours for appointment scheduling.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Can I get a refund?</h3>
              <p className="text-gray-600">
                Yes, we offer 100% refund within 24 hours of purchase if you haven't started using the service. Please refer to our <a href="/refund-policy" className="text-blue-600 hover:underline">Refund Policy</a>.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major payment methods via Razorpay: Credit/Debit Cards, UPI, Net Banking, Digital Wallets, and BNPL options.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Do you provide support after purchase?</h3>
              <p className="text-gray-600">
                Yes! All services include 24/7 email and phone support. You can contact us anytime from your dashboard.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Is my payment secure?</h3>
              <p className="text-gray-600">
                100% secure! We use Razorpay, a PCI-DSS Level 1 certified payment processor. Your card details are never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-12 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 text-blue-100">
            {isLoggedIn
              ? `Welcome back, ${user?.name || 'User'}! Click the button below to proceed with your purchase.`
              : 'Login or create an account to purchase this service.'}
          </p>
          <button
            onClick={handlePurchaseNow}
            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition shadow-lg"
          >
            {isLoggedIn ? 'Purchase Now' : 'Login & Purchase'}
          </button>
        </div>
      </section>

      {/* Support Footer */}
      <section className="px-4 py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center text-gray-600">
          <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
          <p className="mb-4">
            Contact our support team at <a href="mailto:help@gsttaxwale.com" className="text-blue-600 hover:underline">help@gsttaxwale.com</a> or call <a href="tel:+91-9999999999" className="text-blue-600 hover:underline">+91-9999999999</a>
          </p>
          <p className="text-sm text-gray-500">Available Monday - Friday, 9 AM - 6 PM IST</p>
        </div>
      </section>
    </div>
  );
}
