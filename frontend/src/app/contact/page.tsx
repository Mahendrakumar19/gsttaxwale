"use client";

import React, { useEffect, useState } from 'react';
import ContactForm from '../../components/ContactForm';
import Link from 'next/link';
import api from '../../lib/api';
import { MapPin, Mail, Phone, ExternalLink, Loader2 } from 'lucide-react';

interface Location {
  id: number;
  name: string;
  address: string;
  email: string | null;
  phone: string | null;
  mapUrl: string | null;
}

export default function ContactPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Referral State
  const [refName, setRefName] = useState('');
  const [refEmail, setRefEmail] = useState('');
  const [refPhone, setRefPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [submittingRef, setSubmittingRef] = useState(false);
  
  // Dashboard State
  const [friendPhone, setFriendPhone] = useState('');

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
      <section className="py-20 px-6 border-t border-gray-200 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Offices</h2>
            <p className="text-gray-600">Visit us at any of our branches for professional assistance</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : locations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {locations.map((loc) => (
                <div key={loc.id} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white transform group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{loc.name}</h3>
                  <div className="space-y-4 mb-8">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {loc.address}
                    </p>
                  </div>
                  
                  {loc.mapUrl && (
                    <a 
                      href={loc.mapUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors duration-300 text-sm tracking-wide"
                    >
                      <ExternalLink className="w-4 h-4" />
                      VIEW ON GOOGLE MAPS
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 italic">No office locations added yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Refer and Earn Section */}
      <section className="py-24 px-6 bg-[#F8FAFF] border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <h2 className="text-5xl font-black text-[#002B49] mb-6 leading-tight">
                Refer a Friend & <br />
                <span className="text-[#2563EB]">Get Rewarded</span>
              </h2>
              <p className="text-[#4B5E74] text-xl mb-10 font-medium">
                Join Our Exciting Referral Program Today! Share the expertise of GST Tax Wale and earn rewards.
              </p>
              
              <div className="bg-[#EBF5FF] border-l-4 border-[#2563EB] rounded-r-2xl p-8 mb-10 relative overflow-hidden group">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-2xl animate-bounce">👋</div>
                  <div>
                    <h3 className="text-2xl font-black text-[#002B49] mb-2 uppercase tracking-tighter">
                      Hi {refName || 'Future Partner'}
                    </h3>
                    <p className="text-[#4B5E74] leading-relaxed">
                      Refer your friends to GST Tax Wale's <span className="font-bold text-[#002B49]">350+ services</span>, and get <span className="font-bold text-[#2563EB]">points as a token of gratitude</span> for every successful referral.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-[#4B5E74]">
                    100+ referrers have already earned exciting rewards
                  </p>
                </div>
                
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              </div>
            </div>

            {/* Right Card (Dashboard) */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-[#E5E9F0] shadow-[0_20px_50px_rgba(0,43,73,0.1)] relative overflow-hidden">
              {referralCode ? (
                <div className="animate-in zoom-in duration-500">
                  <div className="mb-10 pb-10 border-b border-[#F0F4F8]">
                    <h3 className="text-xl font-bold text-[#002B49] mb-6">Share your Unique Referral Link</h3>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[#F8FAFF] border border-[#E5E9F0] rounded-xl px-4 py-4 font-mono text-sm text-[#4B5E74] overflow-hidden whitespace-nowrap text-ellipsis">
                        {`https://gsttaxwale.com/?ref=${referralCode}`}
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`https://gsttaxwale.com/?ref=${referralCode}`);
                          alert('Referral link copied!');
                        }}
                        className="bg-[#002B49] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#001D32] transition-colors whitespace-nowrap"
                      >
                        Copy Link
                      </button>
                    </div>
                    <div className="flex gap-4 mt-6">
                      <a 
                        href={`https://wa.me/?text=${encodeURIComponent(`Check out GST Tax Wale! Use my referral code ${referralCode} for expert tax services: https://gsttaxwale.com/?ref=${referralCode}`)}`}
                        target="_blank"
                        className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </a>
                      <a href="#" className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                      <a href="#" className="w-12 h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                      </a>
                    </div>
                  </div>
                  
                  <div className="pt-10">
                    <h3 className="text-xl font-bold text-[#002B49] mb-6">Or send by mobile number</h3>
                    <div className="flex gap-2">
                      <input 
                        type="tel" 
                        placeholder="Enter Your Friend Mobile Number"
                        value={friendPhone}
                        onChange={(e) => setFriendPhone(e.target.value)}
                        className="flex-1 bg-[#F8FAFF] border border-[#E5E9F0] rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
                      />
                      <button 
                        onClick={() => {
                          if (friendPhone.length < 10) return alert('Enter a valid mobile number');
                          window.open(`https://wa.me/91${friendPhone}?text=${encodeURIComponent(`Hey! Join GST Tax Wale using my referral code ${referralCode} for expert tax services! https://gsttaxwale.com`)}`, '_blank');
                        }}
                        className="bg-[#002B49] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#001D32] transition-colors whitespace-nowrap"
                      >
                        Send SMS
                      </button>
                    </div>
                    <p className="mt-4 text-sm text-[#4B5E74] italic">
                      Separate multiple mobile number with commas.
                    </p>
                    <button 
                      onClick={() => setReferralCode('')}
                      className="mt-6 text-sm font-bold text-[#2563EB] hover:underline"
                    >
                      ← Generate another code
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-500">
                  <h3 className="text-2xl font-black text-[#002B49] mb-8 text-center uppercase tracking-widest">Referral Details</h3>
                  <form className="space-y-5" onSubmit={handleReferralSubmit}>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#002B49] uppercase ml-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter your name" 
                        value={refName}
                        onChange={(e) => setRefName(e.target.value)}
                        className="w-full px-5 py-4 bg-[#F8FAFF] border border-[#E5E9F0] rounded-2xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all font-medium" 
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#002B49] uppercase ml-1">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={refEmail}
                        onChange={(e) => setRefEmail(e.target.value)}
                        className="w-full px-5 py-4 bg-[#F8FAFF] border border-[#E5E9F0] rounded-2xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all font-medium" 
                        required 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#002B49] uppercase ml-1">Mobile Number</label>
                      <input 
                        type="tel" 
                        placeholder="Enter your mobile number" 
                        value={refPhone}
                        onChange={(e) => setRefPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-5 py-4 bg-[#F8FAFF] border border-[#E5E9F0] rounded-2xl focus:ring-2 focus:ring-[#2563EB] outline-none transition-all font-medium" 
                        required 
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button 
                        type="submit" 
                        disabled={submittingRef}
                        className="w-full bg-[#2563EB] text-white font-black py-5 rounded-2xl hover:bg-[#1D4ED8] hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-lg uppercase tracking-widest"
                      >
                        {submittingRef ? 'GENERATING...' : 'GET MY REFERRAL CODE'}
                      </button>
                      <p className="mt-4 text-center text-[10px] text-[#4B5E74] font-bold uppercase tracking-wider">
                        By clicking, you agree to our Referral Program T&C.
                      </p>
                    </div>
                  </form>
                </div>
              )}
            </div>
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

