"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/tickets`,
        config
      );
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
    <div className="min-h-screen bg-white text-gray-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="text-blue-600" size={28} />
            <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          </div>
          <p className="text-gray-600">Manage customer support tickets</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6 hover:bg-slate-700/30 transition cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-gray-900 font-semibold text-lg mb-1">{ticket.subject}</h3>
                      <div className="flex items-center gap-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-1">
                          <User size={14} />
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
                          ? 'bg-purple-900/30 text-purple-400'
                          : 'bg-yellow-900/30 text-yellow-400'
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
    </div>
  );
}
