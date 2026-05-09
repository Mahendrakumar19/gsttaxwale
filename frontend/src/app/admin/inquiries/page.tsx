'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mail, Phone, Calendar, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'responded' | 'closed';
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await api.get('/api/admin/inquiries');
      setInquiries(response.data.data?.inquiries || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/api/admin/inquiries/${id}`, { status });
      fetchInquiries();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await api.delete(`/api/admin/inquiries/${id}`);
      fetchInquiries();
    } catch (err) {
      alert('Failed to delete inquiry');
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      inquiry.name.toLowerCase().includes(q) ||
      inquiry.email.toLowerCase().includes(q) ||
      inquiry.subject.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-screen bg-white text-gray-900">Loading inquiries...</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Inquiries</h1>
            <p className="text-gray-600 mt-1">Manage messages from the public contact form</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
               <p className="text-xs text-blue-600 font-medium uppercase">New Inquiries</p>
               <p className="text-2xl font-bold text-blue-900">{inquiries.filter(i => i.status === 'new').length}</p>
             </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-xs relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="px-8 py-8">
        <div className="space-y-4">
          {filteredInquiries.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Mail size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No inquiries found</p>
            </div>
          ) : (
            filteredInquiries.map((inquiry) => (
              <div key={inquiry.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition group">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{inquiry.subject}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        inquiry.status === 'new' ? 'bg-blue-100 text-blue-700' :
                        inquiry.status === 'responded' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">{inquiry.message}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5 font-medium text-gray-900">
                        <CheckCircle size={14} className="text-blue-500" />
                        {inquiry.name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} />
                        {inquiry.email}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} />
                        {inquiry.phone}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {new Date(inquiry.createdAt).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col gap-2 justify-end">
                    {inquiry.status === 'new' && (
                      <button
                        onClick={() => handleStatusUpdate(inquiry.id, 'responded')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-bold"
                      >
                        Mark Responded
                      </button>
                    )}
                    {inquiry.status !== 'closed' && (
                      <button
                        onClick={() => handleStatusUpdate(inquiry.id, 'closed')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-bold"
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(inquiry.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete Inquiry"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
