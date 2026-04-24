"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { Users, ArrowLeft, Mail, Phone } from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    if (!token) {
      router.push('/admin');
      return;
    }

    loadCustomers(token);
  }, [router]);

  async function loadCustomers(token: string) {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/customers`,
        config
      );
      setCustomers(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="hover:text-purple-400 transition">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-3">
          <Users size={32} className="text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-slate-400">Manage all customers</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="grid gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No customers found
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-slate-600 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{customer.name}</h3>
                  <div className="flex flex-col gap-2 mt-2 text-slate-400 text-sm">
                    <span className="flex items-center gap-2">
                      <Mail size={16} />
                      {customer.email}
                    </span>
                    {customer.phone && (
                      <span className="flex items-center gap-2">
                        <Phone size={16} />
                        {customer.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Member since</p>
                  <p className="text-sm font-semibold">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
