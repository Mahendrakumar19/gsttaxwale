"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';
import { AlertCircle, MessageSquare, User, Filter, Calendar } from 'lucide-react';

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

  if (loading && tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Querying Support Ledger...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resolution Governance</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Monitoring and processing institutional support requests and inquiry nodes</p>
        </div>

        <button 
          onClick={loadTickets}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:bg-slate-50 active:scale-95 uppercase tracking-widest text-[10px]"
        >
          {refreshing ? <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <Filter size={14} />}
          Synchronize Data
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Pending Nodes</p>
           <p className="text-3xl font-bold text-slate-900 leading-none">{stats.open}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">In Resolution</p>
           <p className="text-3xl font-bold text-slate-900 leading-none">{stats.inProgress}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Settled Nodes</p>
           <p className="text-3xl font-bold text-slate-900 leading-none">{stats.resolved}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm border-l-4 border-l-slate-900">
           <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-2">Critical Assets</p>
           <p className="text-3xl font-bold text-slate-900 leading-none">{stats.urgent}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-10 bg-slate-50 p-1.5 rounded-2xl w-fit border border-slate-100">
        {[
          { id: 'all', label: 'Complete Ledger' },
          { id: 'open', label: 'Pending' },
          { id: 'in-progress', label: 'Active' },
          { id: 'resolved', label: 'Archived' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
              filter === t.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 py-32 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">🎫</div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Ledger Vacuum Detected</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">No operational nodes registered in this classification</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTickets.map((ticket: any) => (
            <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`}>
              <div className="bg-white rounded-2xl border border-slate-200 p-10 hover:border-slate-900 transition-all group flex flex-col md:flex-row gap-10 shadow-sm hover:shadow-xl">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                      ticket.priority === 'urgent' ? 'bg-slate-900 border-slate-900 text-white' :
                      ticket.priority === 'high' ? 'bg-slate-100 border-slate-200 text-slate-600' :
                      'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      {ticket.priority} Priority
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                      ticket.status === 'resolved' ? 'bg-slate-50 border-slate-100 text-slate-400' :
                      ticket.status === 'in-progress' ? 'bg-slate-900 border-slate-900 text-white' :
                      'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      {ticket.status}
                    </span>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                       <Calendar size={12} className="text-slate-200" />
                       {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3 group-hover:translate-x-1 transition-transform">{ticket.subject}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-0 font-medium leading-relaxed">{ticket.description}</p>
                </div>

                <div className="md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-50 pt-8 md:pt-0 md:pl-10">
                   <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 font-bold text-base shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                         {ticket.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Entity</p>
                         <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{ticket.user?.name}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 shadow-[0_0_8px_rgba(15,23,42,0.3)]" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ticket.category}</span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-16 text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">Resolution Protocol • v4.2-ACTIVE</p>
      </div>
    </div>
  );
}
