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
    <div className="px-6 py-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Inquiries</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and respond to public messages and service requests</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-4">
           <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center">
              <Mail size={20} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Unread</p>
              <p className="text-xl font-bold text-slate-900 leading-none">{inquiries.filter(i => i.status === 'new').length}</p>
           </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold uppercase tracking-wider text-[10px] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
        >
          <option value="all">All Inquiries</option>
          <option value="new">New</option>
          <option value="responded">Responded</option>
          <option value="closed">Resolved</option>
        </select>
      </div>

      {/* Inquiries Feed */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">📬</div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">No Inquiries Found</h3>
            <p className="text-xs text-slate-500 mt-1">Inbox is currently empty</p>
          </div>
        ) : (
          filteredInquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-md transition-shadow relative overflow-hidden">
               <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                     <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          inquiry.status === 'new' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                          inquiry.status === 'responded' ? 'bg-green-50 border-green-100 text-green-700' :
                          'bg-slate-50 border-slate-100 text-slate-400'
                        }`}>
                          {inquiry.status === 'new' ? 'New Inquiry' : inquiry.status === 'responded' ? 'Responded' : 'Resolved'}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                           <Calendar size={12} className="text-slate-300" />
                           {new Date(inquiry.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                     </div>

                     <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-4">{inquiry.subject}</h3>
                     <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap italic">
                        "{inquiry.message}"
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><CheckCircle size={16} /></div>
                           <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sender</p>
                              <p className="text-xs font-bold text-slate-900 uppercase">{inquiry.name}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><Mail size={16} /></div>
                           <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
                              <p className="text-xs font-bold text-slate-900 lowercase">{inquiry.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><Phone size={16} /></div>
                           <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone</p>
                              <p className="text-xs font-bold text-slate-900">{inquiry.phone}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="lg:w-48 flex flex-col gap-2 justify-start pt-2">
                     {inquiry.status === 'new' && (
                       <button
                         onClick={() => handleStatusUpdate(inquiry.id, 'responded')}
                         className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors shadow-sm"
                       >
                         Mark Responded
                       </button>
                     )}
                     {inquiry.status !== 'closed' && (
                       <button
                         onClick={() => handleStatusUpdate(inquiry.id, 'closed')}
                         className="w-full py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 transition-colors"
                       >
                         Mark Resolved
                       </button>
                     )}
                     <button
                       onClick={() => handleDelete(inquiry.id)}
                       className="w-full py-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all mt-4 flex items-center justify-center gap-2"
                     >
                       <Trash2 size={14} />
                       Delete
                     </button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
