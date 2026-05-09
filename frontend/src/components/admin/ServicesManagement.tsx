'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';

export default function ServicesManagement() {
  const [services, setServices] = useState([
    { id: 1, name: 'ITR Filing', basePrice: 999, slashPrice: 1499, active: true },
    { id: 2, name: 'GST Registration', basePrice: 2499, slashPrice: 3999, active: true },
    { id: 3, name: 'GST Filing', basePrice: 1299, slashPrice: 1999, active: true },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Services</h3>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          <Plus size={20} />
          New Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                <p className={`text-xs font-medium mt-1 ${service.active ? 'text-green-600' : 'text-gray-600'}`}>
                  {service.active ? '✓ Active' : 'Inactive'}
                </p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                Service
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-gray-600">Selling Price</p>
                <p className="text-2xl font-bold text-blue-600">₹{service.basePrice}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Original Price (Slash)</p>
                <p className="text-lg text-gray-600 line-through">₹{service.slashPrice}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Discount</p>
                <p className="text-lg font-semibold text-green-600">
                  {Math.round((1 - service.basePrice / service.slashPrice) * 100)}% OFF
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition">
                <Edit2 size={16} />
                Edit Price
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
