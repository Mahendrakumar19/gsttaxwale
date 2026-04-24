"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { MessageSquare, ArrowLeft } from 'lucide-react';

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    if (!token) {
      router.push('/admin');
      return;
    }

    loadTickets(token);
  }, [router]);

  async function loadTickets(token: string) {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/tickets`,
        config
      );
      setTickets(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  const filteredTickets = filterStatus === 'all'
    ? tickets
    : tickets.filter((t) => t.status === filterStatus);

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
          <MessageSquare size={32} className="text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold">Support Tickets</h1>
            <p className="text-slate-400">Manage customer support tickets</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === 'all'
              ? 'bg-purple-600'
              : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus('open')}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === 'open'
              ? 'bg-purple-600'
              : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          Open
        </button>
        <button
          onClick={() => setFilterStatus('closed')}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === 'closed'
              ? 'bg-purple-600'
              : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          Closed
        </button>
      </div>

      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No tickets found
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-slate-600 transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{ticket.title}</h3>
                  <p className="text-slate-400 text-sm mt-2">{ticket.description}</p>
                  <div className="flex gap-3 mt-4">
                    <span className="text-xs text-slate-400">
                      ID: {ticket.id.slice(0, 8)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      ticket.priority === 'high' ? 'bg-red-900/30 text-red-300' :
                      ticket.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
                      'bg-green-900/30 text-green-300'
                    }`}>
                      {ticket.priority} priority
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    ticket.status === 'open'
                      ? 'bg-blue-900/30 text-blue-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {ticket.status}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(ticket.createdAt).toLocaleDateString()}
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
