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
    <div className="glassmorphic-light p-6 group border border-amber-500/20 hover:border-amber-400/50 transition-all duration-300 rounded-xl hover:shadow-lg hover:shadow-amber-600/20 hover:scale-105">
      {/* Header with Icon and Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{service.title}</h3>
          <div className="inline-block px-3 py-1 text-xs font-semibold text-amber-900 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full">
            Premium Service
          </div>
        </div>
        <div className="text-3xl ml-3">💰</div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 mb-5 h-10 line-clamp-2">{service.description}</p>

      {/* Features List */}
      <ul className="mt-5 space-y-3 text-sm text-slate-200 mb-6 pb-6 border-b border-slate-600/40">
        {features?.map((f: string, i: number) => (
          <li key={i} className="flex items-start space-x-3">
            <span className="text-amber-400 font-bold text-lg leading-none mt-0.5">✓</span>
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      {/* Pricing and CTA */}
      <div className="flex items-center justify-between mt-6">
        <div>
          <div className="text-sm text-slate-400 mb-1">Price</div>
          <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text">
            ₹{service.price}
          </div>
          <div className="text-xs text-slate-500 mt-1">One-time fee</div>
        </div>
        <Link 
          href={buyHref || `/checkout?serviceId=${service.id}`} 
          className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white px-5 py-3 rounded-lg hover:from-amber-700 hover:to-yellow-600 hover:shadow-lg hover:shadow-amber-600/40 active:scale-95 transition-all font-semibold text-sm whitespace-nowrap ml-4"
        >
          Buy Now
        </Link>
      </div>
    </div>
  );
}
