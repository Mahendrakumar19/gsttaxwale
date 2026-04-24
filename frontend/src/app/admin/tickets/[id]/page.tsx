"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { ArrowLeft, MessageSquare, User, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function AdminTicketDetails() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id;
  
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    resolution: '',
    priority: ''
  });

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();

    if (!token || user?.role !== 'admin') {
      router.push('/admin');
      return;
    }

    loadTicket();
  }, [ticketId, router]);

  async function loadTicket() {
    try {
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tickets/${ticketId}`,
        config
      );
      const data = res.data.data?.ticket;
      setTicket(data);
      setFormData({
        status: data.status,
        resolution: data.resolution || '',
        priority: data.priority
      });
    } catch (err) {
      console.error('Failed to load ticket', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateTicket(e: React.FormEvent) {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tickets/${ticketId}`,
        formData,
        config
      );
      setTicket(res.data.data?.ticket);
      alert('Ticket updated successfully');
    } catch (err) {
      console.error('Failed to update ticket', err);
      alert('Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading ticket...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-red-400 text-xl">Ticket not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/tickets" className="text-slate-400 hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-white">Support Ticket</h1>
        </div>

        {/* Ticket Info */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 rounded-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{ticket.subject}</h2>
              <div className="space-y-2 text-slate-300 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-amber-400" />
                  {ticket.user?.name} ({ticket.user?.email})
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-amber-400" />
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase">Status</span>
                <div className={`text-lg font-bold capitalize ${
                  ticket.status === 'resolved' || ticket.status === 'closed' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {ticket.status}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase">Priority</span>
                <div className={`text-lg font-bold capitalize ${
                  ticket.priority === 'urgent' || ticket.priority === 'high' ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {ticket.priority}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase">Category</span>
                <div className="text-lg font-bold text-slate-200 capitalize">{ticket.category}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6 pb-6 border-b border-slate-600/30">
            <h3 className="text-slate-400 text-sm font-semibold mb-2 uppercase">Description</h3>
            <p className="text-white whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleUpdateTicket} className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Update Ticket</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-600/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-600/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-semibold mb-2">Resolution</label>
            <textarea
              value={formData.resolution}
              onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
              placeholder="Add resolution details..."
              rows={4}
              className="w-full bg-slate-900/50 border border-slate-600/30 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold py-3 rounded-lg hover:from-amber-500 hover:to-amber-400 transition disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}
