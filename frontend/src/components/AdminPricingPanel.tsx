'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Trash2, Plus } from 'lucide-react';
import api from '@/lib/api';

interface ServicePrice {
  serviceId: number;
  title: string;
  original_price: number;
  slash_price: number | null;
  discount_price: number;
}

export default function AdminPricingPanel() {
  const [services, setServices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slashPrice, setSlashPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await api.get('/api/admin/pricing');
      if (response.data.success) {
        setServices(response.data.data.pricings);
      }
    } catch (err) {
      setError('Failed to load pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: ServicePrice) => {
    setEditingId(service.serviceId);
    setSlashPrice((service.slash_price || service.original_price || '').toString());
    setDiscountPrice((service.discount_price || service.original_price || '').toString());
    setError('');
    setSuccess('');
  };

  const handleSave = async (serviceId: number) => {
    if (!discountPrice) {
      setError('Discount price is required');
      return;
    }

    try {
      const response = await api.post('/api/admin/pricing', {
        serviceId,
        slash_price: slashPrice ? parseFloat(slashPrice) : null,
        discount_price: parseFloat(discountPrice),
      });

      if (response.data.success) {
        setSuccess('Pricing updated successfully');
        setEditingId(null);
        fetchPricing();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update pricing');
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (!confirm('Remove pricing override for this service?')) return;

    try {
      await api.delete(`/api/admin/pricing/${serviceId}`);
      setSuccess('Pricing removed');
      fetchPricing();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to remove pricing');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading pricing...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-blue-600" />
          Service Pricing Management
        </h2>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Service</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Original Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slash Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Discount Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.serviceId} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{service.title}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">₹{service.original_price}</td>

                {editingId === service.serviceId ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={slashPrice}
                        onChange={(e) => setSlashPrice(e.target.value)}
                        placeholder="Original price to show"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave blank to use original</p>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        placeholder="New price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      />
                    </td>
                    <td className="px-6 py-4 space-x-2 flex">
                      <button
                        onClick={() => handleSave(service.serviceId)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-900 rounded-lg text-sm hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">
                      {service.slash_price ? (
                        <p className="font-semibold text-orange-600">₹{service.slash_price}</p>
                      ) : (
                        <p className="text-gray-500 italic">None</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-green-600">₹{service.discount_price}</p>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      {service.slash_price && (
                        <button
                          onClick={() => handleDelete(service.serviceId)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-900 space-y-1">
          <li>• <strong>Original Price:</strong> Service's standard price from database</li>
          <li>• <strong>Slash Price:</strong> The price you want to show with strikethrough (e.g., ₹999)</li>
          <li>• <strong>Discount Price:</strong> The actual price customers pay (e.g., ₹499)</li>
          <li>• Leave Slash Price blank to use the Original Price</li>
          <li>• Example: Slash Price = ₹999, Discount Price = ₹499 → Shows <s>₹999</s> → ₹499</li>
        </ul>
      </div>
    </div>
  );
}
