"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';
import { AlertCircle, MessageSquare, User, Filter } from 'lucide-react';

export default function AdminTickets() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();
    if (!token || user?.role !== 'admin') {
      router.push('/admin');
      return;
    }
    loadTickets();
    const interval = setInterval(loadTickets, 5000);
    return () => clearInterval(interval);
  }, [router]);

  async function loadTickets() {
    setRefreshing(true);
    try {
      const res = await api.get('/api/admin/tickets');
      setTickets(res.data.data?.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length
  };

  return (
    <div className="px-6 py-10 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-widest">Support Operations</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Ticket Terminal</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor and resolve system-wide support inquiries</p>
        </div>

        <button 
          onClick={loadTickets}
          className="flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-900 px-6 py-4 rounded-[1.5rem] font-black transition-all shadow-sm hover:bg-slate-50 active:scale-95 uppercase tracking-widest text-[10px]"
        >
          {refreshing ? <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <Filter size={16} />}
          Synchronize Data
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
           <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Awaiting Response</p>
           <p className="text-3xl font-black text-slate-900">{stats.open}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
           <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">In Process</p>
           <p className="text-3xl font-black text-slate-900">{stats.inProgress}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
           <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Success Status</p>
           <p className="text-3xl font-black text-slate-900">{stats.resolved}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
           <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Priority Alert</p>
           <p className="text-3xl font-black text-slate-900">{stats.urgent}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 bg-slate-100 p-2 rounded-[2rem] w-fit">
        {[
          { id: 'all', label: 'All Records' },
          { id: 'open', label: 'Open' },
          { id: 'in-progress', label: 'Processing' },
          { id: 'resolved', label: 'Resolved' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              filter === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-24 text-center">
          <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">🎫</div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Archive Empty</h3>
          <p className="text-slate-500 font-medium">No tickets match the current selection</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTickets.map((ticket: any) => (
            <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`}>
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                      ticket.priority === 'urgent' ? 'bg-red-50 border-red-100 text-red-600' :
                      ticket.priority === 'high' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                      'bg-blue-50 border-blue-100 text-blue-600'
                    }`}>
                      {ticket.priority} Priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                      ticket.status === 'resolved' ? 'bg-green-50 border-green-100 text-green-700' :
                      ticket.status === 'in-progress' ? 'bg-purple-50 border-purple-100 text-purple-700' :
                      'bg-blue-50 border-blue-100 text-blue-700'
                    }`}>
                      {ticket.status}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <Calendar size={12} />
                       {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-2 group-hover:text-blue-600 transition-colors leading-tight">{ticket.subject}</h3>
                  <p className="text-slate-500 font-medium text-base line-clamp-2 mb-0">{ticket.description}</p>
                </div>

                <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 font-black">
                         {ticket.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned Entity</p>
                         <p className="text-sm font-black text-slate-900 uppercase">{ticket.user?.name}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ticket.category}</span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
