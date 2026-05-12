"use client";
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await api.get('/api/services');
        if (res.data?.success && res.data?.data?.services) {
          setServices(res.data.data.services);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
        toast.error('Could not load services. Please try again later.');
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  function buyHrefFor(service: any) {
    return `/services/${service.id}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-lg text-gray-600 animate-pulse">Loading available services…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="px-4 py-16 border-b border-blue-100 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Our Services & Pricing
          </h1>
          <p className="mb-2 text-xl text-gray-600">
            Complete tax and compliance solutions for individuals and businesses
          </p>
          <p className="mb-8 text-gray-600">
            Transparent pricing. No hidden fees. Expert support included.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {services.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No services available at the moment.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-blue-600 hover:underline"
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-6 transition bg-white border border-gray-200 cursor-pointer rounded-xl hover:border-blue-400 hover:shadow-lg group flex flex-col h-full"
                >
                  <div className="flex-grow">
                    <h3 className="mb-2 text-xl font-bold text-gray-900 transition group-hover:text-blue-600">
                      {service.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      {service.shortDescription || service.description?.substring(0, 80) + '...' || `Professional ${service.title.toLowerCase()} services`}
                    </p>

                    {/* Features List */}
                    {service.features && (
                      <div className="mb-6 space-y-2">
                        {(Array.isArray(service.features) ? service.features : []).slice(0, 3).map((feature: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="text-green-600">✓</span> {feature}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
                    <div>
                      {service.discountedPrice > 0 && service.discountedPrice < service.price ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400 line-through">₹{service.price?.toLocaleString()}</span>
                            <span className="text-xl font-bold text-blue-600">₹{service.discountedPrice?.toLocaleString()}</span>
                          </div>
                          <div className="mt-1 inline-flex items-center px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded w-fit">
                            {Math.round(((service.price - service.discountedPrice) / service.price) * 100)}% OFF
                          </div>
                        </div>
                      ) : (
                        <div className="text-xl font-bold text-blue-600">₹{service.price?.toLocaleString()}</div>
                      )}
                    </div>
                    <Link
                      href={buyHrefFor(service)}
                      className="px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-4 py-16 border-t border-blue-100 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 md:text-4xl">
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
                <div className="mb-4 text-5xl">{item.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
