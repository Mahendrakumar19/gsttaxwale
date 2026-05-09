'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import api from '@/lib/api';

interface PricedService {
  serviceId: number;
  title: string;
  description: string;
  slash_price: number | null;
  discount_price: number;
}

interface ServiceDisplayProps {
  limit?: number;
  className?: string;
}

export default function ServiceDisplayWithPricing({ limit = 6, className = '' }: ServiceDisplayProps) {
  const [services, setServices] = useState<PricedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServicesWithPricing();
  }, []);

  const fetchServicesWithPricing = async () => {
    try {
      // Get active pricing from backend
      const pricingResponse = await api.get('/api/pricing/active');
      const pricingMap = new Map<number, { slash_price: number | null, discount_price: number }>(
        (pricingResponse.data.data.pricing || []).map((p: any) => [
          p.service_id || p.serviceId,
          {
            slash_price: p.slash_price,
            discount_price: p.discount_price,
          },
        ])
      );

      // Get services
      const servicesResponse = await api.get('/api/services?limit=' + limit);
      const servicesData = (servicesResponse.data.data?.services || []).map((service: any) => {
        const pricing = pricingMap.get(service.id);
        return {
          serviceId: service.id,
          title: service.title,
          description: service.description,
          slash_price: pricing?.slash_price || null,
          discount_price: pricing?.discount_price || service.price,
        };
      });

      setServices(servicesData);
    } catch (err) {
      console.error('Failed to fetch services with pricing:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {services.map((service) => (
        <div key={service.serviceId} className="bg-white border-2 border-blue-300 rounded-lg p-4 hover:shadow-lg transition">
          <h3 className="font-bold text-gray-900 text-lg mb-2">{service.title}</h3>
          <p className="text-sm text-gray-700 mb-4">{service.description}</p>

          {/* Pricing Section */}
          <div className="mb-4 py-3 border-t border-b border-gray-200">
            <div className="flex items-center gap-3">
              {service.slash_price && service.slash_price !== service.discount_price ? (
                <>
                  {/* Show slash price */}
                  <span className="text-lg text-gray-400 line-through">₹{service.slash_price}</span>
                  {/* Show discount price */}
                  <span className="text-2xl font-bold text-green-600">₹{service.discount_price}</span>
                  {/* Show discount percentage */}
                  {service.slash_price > 0 && (
                    <span className="ml-auto px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                      {Math.round(((service.slash_price - service.discount_price) / service.slash_price) * 100)}% OFF
                    </span>
                  )}
                </>
              ) : (
                <span className="text-2xl font-bold text-blue-600">₹{service.discount_price}</span>
              )}
            </div>
          </div>

          <button className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Purchase
          </button>
        </div>
      ))}
    </div>
  );
}
