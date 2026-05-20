"use client";

import React, { useEffect, useState } from 'react';
import ContactForm from '../../components/ContactForm';
import Link from 'next/link';
import api from '../../lib/api';
import { MapPin, Mail, Phone, ExternalLink, Loader2, Search, ArrowRight, Copy, Share2, Users, IndianRupee, Gift, Check, Send } from 'lucide-react';

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email: string | null;
  phone: string | null;
  mapUrl: string | null;
}

export default function ContactPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Referral State
  const [refName, setRefName] = useState('');
  const [refEmail, setRefEmail] = useState('');
  const [refPhone, setRefPhone] = useState('');
  const [refereeName, setRefereeName] = useState('');
  const [refereeEmail, setRefereeEmail] = useState('');
  const [refereePhone, setRefereePhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [submittingRef, setSubmittingRef] = useState(false);
  
  // Dashboard State
  const [friendPhone, setFriendPhone] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/api/locations');
      if (response.data.success) {
        setLocations(response.data.data.locations);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLocations(prev => prev.length > 0 ? prev : []); // Ensure state update for loading end
      setLoading(false);
    }
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName || !refEmail || !refPhone) {
      alert('Please fill out all fields.');
      return;
    }
    setSubmittingRef(true);
    try {
      const response = await api.post('/api/referrals/generate-public', {
        name: refName,
        email: refEmail,
        phone: refPhone
      });
      if (response.data.success) {
        setReferralCode(response.data.data.referralCode);
      }
    } catch (error: any) {
      console.error('Referral generation failed:', error);
      alert(error.response?.data?.message || 'Failed to generate referral code. Please try again.');
    } finally {
      setSubmittingRef(false);
    }
  };

  const handleSendFriendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendPhone) {
      alert("Please enter a friend's mobile number");
      return;
    }
    const numbers = friendPhone.split(',').map(n => n.trim()).filter(n => n.length >= 10);
    if (numbers.length === 0) {
      alert("Please enter at least one valid 10-digit mobile number");
      return;
    }

    setSendingSms(true);
    try {
      // Loop and create a lead for each friend number in the background
      for (const num of numbers) {
        try {
          await api.post('/api/referrals/lead', {
            name: `Friend (${num})`,
            email: `friend_${num}@gsttaxwale.com`,
            phone: num,
            serviceInterest: 'General Tax Consultation',
            referralCode: referralCode,
            source: 'contact_page_sms'
          });
        } catch (leadErr) {
          console.warn('Friend lead insertion failed (probably duplicate):', leadErr);
        }
      }
      
      // Open WhatsApp for the first number
      const firstNum = numbers[0];
      const message = `Hey! Join GST Tax Wale using my referral code ${referralCode} for expert tax services! https://gsttaxwale.com/ref/${referralCode}`;
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.open(`sms:${firstNum}?body=${encodeURIComponent(message)}`, '_blank');
      } else {
        window.open(`https://wa.me/91${firstNum}?text=${encodeURIComponent(message)}`, '_blank');
      }
      
      alert(`Invitation registered in GSTTaxWale! Sharing options opened.`);
      setFriendPhone('');
    } catch (err: any) {
      console.error(err);
      const firstNum = numbers[0];
      const message = `Hey! Join GST Tax Wale using my referral code ${referralCode} for expert tax services! https://gsttaxwale.com/ref/${referralCode}`;
      window.open(`https://wa.me/91${firstNum}?text=${encodeURIComponent(message)}`, '_blank');
    } finally {
      setSendingSms(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Contact Section Header
      <section className="pt-24 pb-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Contact Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">We're here to help you with all your tax and compliance needs.</p>
        </div>
      </section> */}

      {/* Dynamic Locations Section */}
      <section className="py-24 px-6 border-t border-gray-200 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Visit Our Offices</h2>
              <p className="text-slate-500 font-medium">Find our presence across multiple cities for in-person consultations</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search city or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm text-sm font-bold"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations
                .filter(loc => 
                  loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (loc.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (loc.state || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((location) => (
                <div 
                  key={location.id} 
                  className="group bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight uppercase tracking-tight">{location.name}</h3>
                    <p className="text-slate-600 text-base leading-relaxed font-semibold whitespace-pre-line">
                      {location.address}
                    </p>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl group-hover:bg-blue-100/50 transition duration-500" />
                </div>
              ))}
              
              {locations.length > 0 && locations.filter(loc => 
                  loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (loc.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (loc.state || '').toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No locations found matching "{searchTerm}"</p>
                </div>
              )}

              {locations.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                   <p className="text-gray-500 italic">No office locations added yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Refer and Earn Section */}
      <section className={`py-24 px-6 border-t transition-colors duration-500 ${referralCode ? 'bg-[#F8FAFF] border-gray-100' : 'bg-gradient-to-br from-[#0F559E] via-[#0E4989] to-[#0A3D75] border-blue-900/30'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {referralCode ? (
              <>
                {/* Screen 2 Left Column */}
                <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700 text-slate-900">
                  <h2 className="text-4xl md:text-5xl font-black text-[#002B49] leading-tight">
                    Refer a Friend & <br />
                    <span className="text-blue-600">Get Rewarded</span>
                  </h2>
                  <p className="text-slate-600 text-lg font-medium">
                    Join Our Exciting Referral Program Today!
                  </p>
                  
                  <div className="bg-[#EBF5FF] border-l-4 border-blue-600 rounded-r-2xl p-8 relative overflow-hidden group">
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="bg-white p-3 rounded-xl shadow-sm text-2xl animate-bounce">👋</div>
                      <div>
                        <h3 className="text-2xl font-black text-[#002B49] mb-2">
                          Hi {refName || 'Partner'}
                        </h3>
                        <p className="text-slate-600 leading-relaxed font-semibold">
                          Refer your friends to GSTTaxWale's <span className="font-bold text-[#002B49]">350+ services</span>, and get <span className="font-bold text-blue-600">5%</span> as a token of gratitude for every successful referral.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                            <img src={`https://i.pravatar.cc/150?u=${i + 15}`} alt="User" />
                          </div>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-slate-600">
                        100+ referrers have already earned exciting rewards
                      </p>
                    </div>
                  </div>
                </div>

                {/* Screen 2 Right Column */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,43,73,0.08)] relative overflow-hidden text-slate-900 animate-in zoom-in duration-500">
                  <div className="mb-8 pb-8 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-[#002B49] mb-4 uppercase tracking-wider">Share your Unique Referral Link</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-mono text-sm text-slate-600 overflow-hidden whitespace-nowrap text-ellipsis flex items-center justify-between">
                          <span>{`https://gsttaxwale.com/ref/${referralCode}`}</span>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`https://gsttaxwale.com/ref/${referralCode}`);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="bg-[#002B49] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#001D32] transition-colors whitespace-nowrap text-xs uppercase tracking-widest flex items-center gap-1.5"
                        >
                          {copiedLink ? <Check size={14} /> : null}
                          {copiedLink ? 'Copied' : 'Copy Link'}
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Referral Code</span>
                          <span className="font-mono text-lg font-black text-amber-900 tracking-tighter">{referralCode}</span>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(referralCode);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }}
                          className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors whitespace-nowrap text-xs uppercase tracking-widest"
                        >
                          {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                          {copiedCode ? 'Copied' : 'Copy Code'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-6">
                      <a 
                        href={`https://wa.me/?text=${encodeURIComponent(`Check out GST Tax Wale! Use my referral code ${referralCode} for expert tax services: https://gsttaxwale.com/ref/${referralCode}`)}`}
                        target="_blank"
                        className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
                      >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </a>
                      <a 
                        href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://gsttaxwale.com/ref/${referralCode}`)}`}
                        target="_blank"
                        className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
                      >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                      <a 
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Use my code ${referralCode} to get premium tax & ITR filings on GST Tax Wale: https://gsttaxwale.com/ref/${referralCode}`)}`}
                        target="_blank"
                        className="w-12 h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
                      >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-[#002B49] mb-4">Or send by mobile number</h3>
                    <form onSubmit={handleSendFriendInvite} className="flex gap-2">
                      <input 
                        type="tel" 
                        placeholder="Enter Your Friend Mobile Number"
                        value={friendPhone}
                        onChange={(e) => setFriendPhone(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-900 font-medium"
                        required
                      />
                      <button 
                        type="submit"
                        disabled={sendingSms}
                        className="bg-[#002B49] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#001D32] transition-colors whitespace-nowrap uppercase tracking-wider text-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {sendingSms ? <Loader2 size={14} className="animate-spin" /> : null}
                        Send SMS
                      </button>
                    </form>
                    <p className="mt-3 text-xs text-slate-500 italic">
                      Separate multiple mobile number with commas.
                    </p>
                    <button 
                      onClick={() => setReferralCode('')}
                      className="mt-6 text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      ← Generate another code
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Screen 1 Left Column */}
                <div className="space-y-12 animate-in fade-in slide-in-from-left duration-700 text-white">
                  <div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">Three Easy Steps</h2>
                    {/* Stepper */}
                    <div className="flex items-center gap-4 mt-8">
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-md">
                          <Share2 size={24} />
                        </div>
                        <span className="text-xs font-semibold mt-2 text-white/80">Share Link</span>
                      </div>
                      <div className="flex-1 h-0.5 border-t-2 border-dashed border-white/20 mb-6"></div>
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-md">
                          <Users size={24} />
                        </div>
                        <span className="text-xs font-semibold mt-2 text-white/80">Refer a Friend</span>
                      </div>
                      <div className="flex-1 h-0.5 border-t-2 border-dashed border-white/20 mb-6"></div>
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-md">
                          <IndianRupee size={24} />
                        </div>
                        <span className="text-xs font-semibold mt-2 text-white/80">Earn Rewards</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className="text-2xl font-bold text-white mb-6">How it works</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                        <p className="text-xs uppercase font-bold text-yellow-400 tracking-wider mb-2">You get</p>
                        <p className="text-4xl font-black text-white mb-2">5%</p>
                        <p className="text-sm text-white/70 leading-relaxed">On every purchase of our services by your friend for up to one year.</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                        <p className="text-xs uppercase font-bold text-yellow-400 tracking-wider mb-2 font-medium">Your friend will get</p>
                        <p className="text-2xl font-bold text-white mb-2 leading-tight">Exclusive discount</p>
                        <p className="text-sm text-white/70 leading-relaxed">Your friend will get curated discounts on every purchase.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Screen 1 Right Column */}
                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl max-w-md mx-auto text-slate-800 border border-slate-100 animate-in fade-in zoom-in duration-500">
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-6 leading-snug">
                    Enter your basic details to generate your unique referral link
                  </h3>
                  <form onSubmit={handleReferralSubmit} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Name" 
                      value={refName}
                      onChange={(e) => setRefName(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-semibold text-slate-900 placeholder-slate-400" 
                      required 
                    />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={refEmail}
                      onChange={(e) => setRefEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-semibold text-slate-900 placeholder-slate-400" 
                      required 
                    />
                    <input 
                      type="tel" 
                      placeholder="Mobile number" 
                      value={refPhone}
                      onChange={(e) => setRefPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-semibold text-slate-900 placeholder-slate-400" 
                      required 
                    />
                    <button 
                      type="submit" 
                      disabled={submittingRef}
                      className="w-full bg-[#002B49] text-white font-bold py-4 rounded-xl hover:bg-[#001D32] transition-colors flex items-center justify-center gap-2 mt-6 uppercase tracking-wider text-sm disabled:opacity-50"
                    >
                      {submittingRef ? 'Generating...' : 'Submit'}
                      <ArrowRight size={18} />
                    </button>
                  </form>
                </div>
              </>
            )}

          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto" id="contact-form">
          <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Send us a Message</h2>
              <p className="text-gray-600 text-lg">Have a specific question? Fill out the form and we'll reply within hours.</p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

