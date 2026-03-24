import React from 'react';

export default async function ServiceDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  let service = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/services/${id}`);
    const json = await res.json();
    service = json.data?.service || null;
  } catch (e) {
    service = null;
  }

  if (!service) return <div className="p-6">Service not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold">{service.title}</h1>
        <p className="text-gray-700 mt-3">{service.description}</p>
        <div className="mt-4 font-bold text-xl">Price: ₹{service.price}</div>
        <ul className="mt-4 list-disc pl-5 text-gray-700">
          {service.features?.map((f: any, i: number) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <div className="mt-6">
          <button onClick={() => (window.location.href = `/checkout?serviceId=${service.id}`)} className="bg-blue-600 text-white px-4 py-2 rounded">Buy Now</button>
        </div>
      </div>
    </div>
  );
}
