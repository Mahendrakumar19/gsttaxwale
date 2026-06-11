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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="text-blue-600" size={22} />
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Support Tickets</h1>
        </div>
        <p className="text-gray-600 text-sm">Manage customer support tickets</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.open}</div>
            <div className="text-gray-600 text-sm">Open Tickets</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.inProgress}</div>
            <div className="text-gray-600 text-sm">In Progress</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.resolved}</div>
            <div className="text-gray-600 text-sm">Resolved</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600 mb-1">{stats.urgent}</div>
            <div className="text-gray-600 text-sm">Urgent</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'open'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'in-progress'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'resolved'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700/30 text-slate-400 hover:text-white'
            }`}
          >
            Resolved
          </button>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No tickets found</div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket: any) => (
              <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`}>
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-blue-300 hover:shadow-sm transition cursor-pointer">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 font-semibold text-base sm:text-lg mb-1 truncate">{ticket.subject}</h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-600 text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          {ticket.user?.name}
                        </div>
                        <div>{new Date(ticket.createdAt).toLocaleDateString()}</div>
                        <div>{ticket.category}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        ticket.priority === 'urgent' 
                          ? 'bg-red-900/30 text-red-400' 
                          : ticket.priority === 'high'
                          ? 'bg-orange-900/30 text-orange-400'
                          : 'bg-blue-900/30 text-blue-400'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === 'resolved' || ticket.status === 'closed'
                          ? 'bg-green-900/30 text-green-400'
                          : ticket.status === 'in-progress'
                          ? 'bg-blue-900/30 text-blue-600'
                          : 'bg-blue-900/30 text-blue-600'  
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-2">{ticket.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}
