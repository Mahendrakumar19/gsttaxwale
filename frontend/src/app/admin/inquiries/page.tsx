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
    <div className="px-6 py-10 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-widest">Public Relations</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Inquiry Control</h1>
          <p className="text-slate-500 font-medium mt-1">Manage public communication and lead generation records</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Mail size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pending Review</p>
              <p className="text-2xl font-black text-slate-900">{inquiries.filter(i => i.status === 'new').length}</p>
           </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm mb-12 flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by identity, subject, or message content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-black uppercase tracking-widest text-[10px] focus:ring-4 focus:ring-blue-500/10 outline-none transition cursor-pointer"
        >
          <option value="all">Filter: All Status</option>
          <option value="new">Filter: New Messages</option>
          <option value="responded">Filter: Followed Up</option>
          <option value="closed">Filter: Resolved</option>
        </select>
      </div>

      {/* Inquiries Feed */}
      <div className="space-y-6 mb-12">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-24 text-center">
            <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">📬</div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Inbox Clear</h3>
            <p className="text-slate-500 font-medium">No inquiries matching your criteria were found</p>
          </div>
        ) : (
          filteredInquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-10 hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                     <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                          inquiry.status === 'new' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                          inquiry.status === 'responded' ? 'bg-green-50 border-green-100 text-green-700' :
                          'bg-slate-50 border-slate-100 text-slate-400'
                        }`}>
                          {inquiry.status === 'new' ? 'Awaiting Action' : inquiry.status === 'responded' ? 'Authenticated Response' : 'Archived'}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <Calendar size={12} className="text-slate-300" />
                           {new Date(inquiry.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                     </div>

                     <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-4 leading-tight">{inquiry.subject}</h3>
                     <p className="text-slate-600 font-medium text-lg leading-relaxed mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100/50 italic whitespace-pre-wrap">
                        "{inquiry.message}"
                     </p>

                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><CheckCircle size={18} /></div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sender Entity</p>
                              <p className="text-sm font-black text-slate-900 uppercase">{inquiry.name}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Mail size={18} /></div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Digital Mail</p>
                              <p className="text-sm font-black text-slate-900 lowercase">{inquiry.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Phone size={18} /></div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Communication</p>
                              <p className="text-sm font-black text-slate-900">{inquiry.phone}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="lg:w-64 flex flex-col gap-3 justify-start pt-2">
                     {inquiry.status === 'new' && (
                       <button
                         onClick={() => handleStatusUpdate(inquiry.id, 'responded')}
                         className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                       >
                         Acknowledge Response
                       </button>
                     )}
                     {inquiry.status !== 'closed' && (
                       <button
                         onClick={() => handleStatusUpdate(inquiry.id, 'closed')}
                         className="w-full py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                       >
                         Finalize Resolution
                       </button>
                     )}
                     <button
                       onClick={() => handleDelete(inquiry.id)}
                       className="w-full py-4 text-red-500 hover:text-white hover:bg-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all mt-4 border border-red-100 hover:border-red-600 active:scale-95 flex items-center justify-center gap-2"
                     >
                       <Trash2 size={14} />
                       Purge Record
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
