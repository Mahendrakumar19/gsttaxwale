import React from 'react';
import Link from 'next/link';

interface ServiceCardProps {
  service: any;
  buyHref: string;
}

export default function ServiceCard({ service, buyHref }: ServiceCardProps) {
  // Parse features from JSON string if needed
  let features: string[] = [];
  if (typeof service.features === 'string') {
    try {
      features = JSON.parse(service.features);
    } catch {
      features = [];
    }
  } else if (Array.isArray(service.features)) {
    features = service.features;
  }

  return (
    <div className="bg-white border border-blue-200 p-5 md:p-6 group hover:border-blue-500 transition-all duration-300 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 flex flex-col h-full">
      {/* Header with Icon and Badge */}
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{service.title}</h3>
          <div className="inline-block px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
            Premium Service
          </div>
        </div>
        <div className="text-3xl ml-3">💼</div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-5 h-10 line-clamp-2">{service.description}</p>

      {/* Features List */}
      <ul className="mt-5 space-y-3 text-sm text-gray-700 mb-6 pb-6 border-b border-blue-100">
        {features?.map((f: string, i: number) => (
          <li key={i} className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold text-lg leading-none mt-0.5">✓</span>
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      {/* Pricing and CTA */}
      <div className="flex items-center justify-between mt-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">Price</div>
          <div className="text-3xl font-bold text-blue-600">
            ₹{service.price}
          </div>
          <div className="text-xs text-gray-500 mt-1">One-time fee</div>
        </div>
        <Link 
          href={buyHref || `/checkout?serviceId=${service.id}`} 
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/40 active:scale-95 transition-all font-semibold text-sm whitespace-nowrap ml-4"
        >
          Buy Now
        </Link>
      </div>
    </div>
  );
}
