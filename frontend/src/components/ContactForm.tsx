"use client";
import React, { useState } from 'react';
import fetchClient from '@/lib/fetchClient';
import { Share2, CheckCircle, Copy, ArrowRight, UserPlus, Phone } from 'lucide-react';
import axios from 'axios';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // Added phone for referral code generation
  const [query, setQuery] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  
  // Referral State
  const [myReferralCode, setMyReferralCode] = useState('');
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [referring, setReferring] = useState(false);
  const [referred, setReferred] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !query) return alert('Please fill all fields');
    setSubmitting(true);
    try {
      // 1. Submit Contact Form
      const response = await fetchClient.post('/api/contact', { name, email, message: query, phone });
      if (response.data?.data?.ticketId) {
        setTicketId(response.data.data.ticketId);
      }
      
      // 2. Try to generate a public referral code for the user so they can refer others
      try {
        const refRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/referrals/generate-public`, {
          name,
          email,
          phone: phone || '0000000000'
        });
        if (refRes.data.success) {
          setMyReferralCode(refRes.data.data.referralCode);
        }
      } catch (err) {
        console.warn('Failed to generate public referral code', err);
      }

      setSent(true);
      // Don't clear name/email yet as we might need them for referral
    } catch (err: any) {
      console.error('Contact submit failed', err);
      alert(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReferral(e: React.FormEvent) {
    e.preventDefault();
    if (!friendName || !friendPhone) return;
    setReferring(true);
    try {
      // We'll use the WhatsApp link approach for "easy" referral as requested
      const text = `Hey ${friendName}! I just contacted GST Tax Wale for expert tax services. Use my referral code ${myReferralCode} if you need help too: ${window.location.origin}/?ref=${myReferralCode}`;
      window.open(`https://wa.me/91${friendPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
      
      // Optionally notify backend (if endpoint exists)
      // await axios.post('/api/referrals/track-lead', { referrerCode: myReferralCode, friendName, friendPhone });
      
      setReferred(true);
    } catch (err) {
      console.error('Referral failed', err);
    } finally {
      setReferring(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(myReferralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (sent) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
        {/* Success Header */}
        <div className="bg-green-50 border border-green-100 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
          <p className="text-gray-600">Thanks {name}, we've received your query and will get back to you shortly.</p>
          {ticketId && (
            <div className="mt-4 inline-block px-4 py-1.5 bg-white border border-green-200 rounded-full text-xs font-bold text-green-700 uppercase tracking-widest">
              Reference: #{ticketId}
            </div>
          )}
        </div>

        {/* Refer a Friend Section */}
        {!referred ? (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Share2 size={24} className="text-blue-200" />
                <h4 className="text-xl font-bold uppercase tracking-tight">Refer a Friend & Earn</h4>
              </div>
              <p className="text-blue-100 mb-8 max-w-md">While you wait, refer a friend who needs tax services. You'll earn commissions on their first purchase!</p>
              
              <form onSubmit={handleReferral} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-blue-200 ml-1">Friend's Name</label>
                    <input 
                      type="text" 
                      value={friendName}
                      onChange={(e) => setFriendName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 outline-none focus:bg-white/20 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-blue-200 ml-1">Friend's Mobile</label>
                    <input 
                      type="tel" 
                      value={friendPhone}
                      onChange={(e) => setFriendPhone(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 outline-none focus:bg-white/20 transition-all"
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={referring}
                  className="w-full py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  {referring ? 'Opening WhatsApp...' : 'Refer via WhatsApp'}
                  <ArrowRight size={18} />
                </button>
              </form>

              {myReferralCode && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-xs font-bold uppercase text-blue-200 mb-3">Or share your code directly</p>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 font-mono font-bold text-xl tracking-widest text-white flex-1 text-center">
                      {myReferralCode}
                    </div>
                    <button 
                      onClick={copyCode}
                      className="p-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition text-white"
                      title="Copy Code"
                    >
                      {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 text-center text-blue-800">
            <h4 className="text-xl font-bold mb-2">Referral Started!</h4>
            <p className="text-sm opacity-90">Thank you for referring {friendName}. We hope they find our services helpful!</p>
            <button onClick={() => setSent(false)} className="mt-6 text-blue-600 font-bold text-sm hover:underline flex items-center justify-center gap-1 mx-auto">
              Go Back to Contact Page
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
          <div className="relative">
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. John Doe" 
              className="w-full pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              required 
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="e.g. john@example.com" 
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            required 
          />
        </div>
      </div>
      
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mobile Number</label>
        <div className="relative">
          <Phone className="absolute left-4 top-4 text-gray-400" size={18} />
          <input 
            value={phone} 
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
            placeholder="For better support & referral tracking" 
            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
          />
        </div>
        <p className="text-[10px] text-gray-400 italic mt-1 ml-1">* Providing your mobile allows us to generate a personalized referral code for you.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Your Message / Query</label>
        <textarea 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          rows={5} 
          placeholder="How can our tax experts help you today?" 
          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" 
          required
        ></textarea>
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={submitting} 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transition-all flex items-center justify-center gap-2"
        >
          {submitting ? 'Sending Message...' : 'Send Inquiry'}
          <ArrowRight size={20} />
        </button>
        <div className="text-center mt-4 text-xs text-gray-500 font-medium">
          We usually respond within 2-4 business hours.
        </div>
      </div>
    </form>
  );
}
