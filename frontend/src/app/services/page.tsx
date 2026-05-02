"use client";
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ServiceCard from '../../components/services/ServiceCard';
import { useRouter } from 'next/navigation';

// Mock services data - Always available
const MOCK_SERVICES = [
  { id: '1', slug: 'itr-filing-individual', title: 'Individual ITR Filing', price: 999, features: ['PAN validation', 'Income verification', 'E-filing submission', 'Expert CA review'] },
  { id: '2', slug: 'gst-registration', title: 'GST Registration & Setup', price: 2499, features: ['Online registration', 'Document verification', 'Portal training', '30-day support'] },
  { id: '3', slug: 'gst-filing-quarterly', title: 'GST Filing (Quarterly)', price: 1299, features: ['GSTR-1 & GSTR-2 filing', 'Input-output match', 'Late fee calculation', 'Amendment support'] },
  { id: '4', slug: 'gst-filing-annual', title: 'GST Annual Return (GSTR-9)', price: 1999, features: ['Annual reconciliation', 'Audit trail preparation', 'Document compilation', 'Amendment support'] },
  { id: '5', slug: 'tds-compliance', title: 'TDS Compliance & Filing', price: 1499, features: ['TDS calculation', 'Quarterly filing', 'Challan preparation', 'Outstanding TDS tracking'] },
  { id: '6', slug: 'business-tax-consulting', title: 'Business Tax Consulting (2 hrs)', price: 4999, features: ['2-hour consultation', 'Personalized strategy', 'Document review', 'Action plan'] },
  { id: '7', slug: 'audit-support', title: 'Income Tax Audit Support', price: 7999, features: ['Document compilation', 'Audit defense', 'Notice response', 'Follow-up support'] },
  { id: '8', slug: 'startup-tax-setup', title: 'Startup Tax Setup Package', price: 9999, features: ['GST registration', 'PAN registration', 'Accounting setup', '6-month support'] },
  { id: '9', slug: 'payroll-compliance', title: 'Monthly Payroll Compliance', price: 4999, features: ['Salary processing', 'TDS filing', 'Statutory compliance', 'Employee reports'] },
  { id: '10', slug: 'investment-advisory', title: 'Tax Saving Investment Advisory', price: 2999, features: ['Income analysis', 'Investment recommendations', 'Tax saving strategies', 'Quarterly review'] },
  { id: '11', slug: 'nri-tax-filing', title: 'NRI Income Tax Filing', price: 3999, features: ['NRI-specific ITR', 'Foreign asset filing', 'Remittance tracking', 'FATCA compliance'] },
  { id: '12', slug: 'professional-tax-filing', title: 'Professional Income Tax', price: 2499, features: ['Professional deduction', 'Business expense analysis', 'Quarterly advance tax', 'Audit support'] },
  { id: '13', slug: 'capital-gains-planning', title: 'Capital Gains Tax Planning', price: 3499, features: ['Gain calculation', 'Exemption planning', 'Loss offsetting', 'Investment recommendations'] },
  { id: '14', slug: 'property-tax-setup', title: 'Property & Rental Tax Setup', price: 2999, features: ['Rental income tracking', 'Expense documentation', 'Depreciation calculation', 'Annual ITR filing'] },
  { id: '15', slug: 'tax-notice-response', title: 'Income Tax Notice Response', price: 5999, features: ['Notice analysis', 'Document compilation', 'Written response', 'Meeting support'] }
];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>(MOCK_SERVICES);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Try to fetch from backend API, but use mock data if it fails
    async function fetchServices() {
      try {
        const res = await api.get('/api/services');
        if (res.data?.status === 'success' && res.data?.data?.services) {
          setServices(res.data.data.services);
        }
      } catch (err) {
        console.log('Using mock services (API not available)');
        // Keep mock data on error
      }
      setLoading(false);
    }
    // Always show mock data first, then try to fetch real data
    setServices(MOCK_SERVICES);
    fetchServices();
  }, []);

  function buyHrefFor(service: any) {
    // Link to service detail page, not directly to checkout
    return `/services/${service.id}`;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white px-4 py-16 border-b border-blue-100">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services & Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Complete tax and compliance solutions for individuals and businesses
          </p>
          <p className="text-gray-600 mb-8">
            Transparent pricing. No hidden fees. Expert support included.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition group cursor-pointer"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Professional {service.title.toLowerCase()} services
                </p>

                {/* Features List */}
                {service.features && (
                  <div className="mb-6 space-y-2">
                    {(typeof service.features === 'string' ? JSON.parse(service.features) : service.features)
                      .slice(0, 3)
                      .map((feature: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-green-600">✓</span> {feature}
                        </div>
                      ))}
                  </div>
                )}

                {/* Price and CTA */}
                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">₹{service.price?.toLocaleString()}</div>
                  </div>
                  <a
                    href={buyHrefFor(service)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-blue-50 px-4 py-16 border-t border-blue-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose GST Tax Wale?
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              { icon: '👨‍💼', title: 'Expert Team', desc: 'Certified tax professionals with years of experience' },
              { icon: '🏆', title: '100% Accurate', desc: 'Zero error rate with government compliance' },
              { icon: '⚡', title: 'Fast Processing', desc: 'Quick turnaround time for all filings' },
              { icon: '🛡️', title: '10 AM - 6 PM Support', desc: 'Dedicated support for all your queries' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-white border-t border-blue-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose a service above or contact our team to discuss your specific tax compliance needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/auth/login" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
              Buy Now
            </a>
            <a href="/contact" className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
