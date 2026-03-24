"use client";
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ServiceCard from '../../components/services/ServiceCard';
import { useRouter } from 'next/navigation';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function fetchServices() {
      try {
        const res = await api.get('/api/services');
        if (mounted) setServices(res.data.data.services || []);
      } catch (err) {
        console.error('Failed to load services', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchServices();
    return () => {
      mounted = false;
    };
  }, []);

  function buyHrefFor(service: any) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      const returnUrl = `/checkout?serviceId=${service.id}`;
      return `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`;
    }
    return `/checkout?serviceId=${service.id}`;
  }

  if (loading) return <div className="p-6">Loading services…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Our Services</h1>
      {services.length === 0 ? (
        <div className="text-gray-600">No services available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s: any) => (
            <ServiceCard key={s.id} service={s} buyHref={buyHrefFor(s)} />
          ))}\n        </div>
      )}
    </div>
  );
}
