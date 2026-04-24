'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Service {
  id: number;
  name?: string;
  description?: string;
  price?: number;
  duration?: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        setServices(data.data?.services || []);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Tax Platform
          </Link>
          <div className="flex gap-4">
            <Link href="/services" className="text-slate-700 hover:text-blue-600">
              Services
            </Link>
            <Link href="/contact" className="text-slate-700 hover:text-blue-600">
              Contact
            </Link>
            <Link href="/login" className="text-slate-700 hover:text-blue-600">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-blue-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-blue-100">
            Professional tax and accounting solutions for all your needs
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No services available yet.</p>
            <Link href="/" className="text-blue-600 hover:underline">
              Back to home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {service.name || 'Service'}
                </h3>
                <p className="text-slate-600 mb-4 line-clamp-3">
                  {service.description || 'Professional tax service'}
                </p>
                <div className="mb-6">
                  {service.price && (
                    <>
                      <p className="text-3xl font-bold text-blue-600">
                        ₹{service.price}
                      </p>
                      {service.duration && (
                        <p className="text-sm text-slate-500">
                          Turnaround: {service.duration}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <button
                  onClick={() => router.push(`/checkout?serviceId=${service.id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2026 Tax Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
