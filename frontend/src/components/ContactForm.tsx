"use client";
import React, { useState } from 'react';
import fetchClient from '@/lib/fetchClient';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return alert('Please fill all fields');
    setSubmitting(true);
    try {
      const response = await fetchClient.post('/api/contact', { name, email, message });
      if (response.data?.data?.ticketId) {
        setTicketId(response.data.data.ticketId);
      }
      setSent(true);
      setName(''); setEmail(''); setMessage('');
    } catch (err: any) {
      console.error('Contact submit failed', err);
      alert(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-green-800">
        <p className="font-bold mb-1">Message Sent!</p>
        <p className="text-sm opacity-90">Thanks — your message has been received. We will contact you soon.</p>
        {ticketId && (
          <p className="mt-4 text-xs font-mono bg-white/50 p-2 rounded border border-green-300">
            Ticket ID: {ticketId}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
      </div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Describe your query" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"></textarea>
      <div className="flex items-center justify-between">
        <button type="submit" disabled={submitting} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold">
          {submitting ? 'Sending…' : 'Send Message'}
        </button>
        <div className="text-sm text-gray-600">We reply within 24 hours</div>
      </div>
    </form>
  );
}
