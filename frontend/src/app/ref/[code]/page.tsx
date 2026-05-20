"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ShieldCheck, Clock, Users, ArrowRight, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReferralLandingPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  const [referrerName, setReferrerName] = useState<string>('');
  const [loadingReferrer, setLoadingReferrer] = useState<boolean>(true);
  const [invalidCode, setInvalidCode] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceInterest: 'GST Return Filing',
    notes: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!code) return;

    // Fetch Referrer Name
    api.get(`/api/referrals/referrer/${code}`)
      .then(res => {
        if (res.data?.success) {
          setReferrerName(res.data.data?.name || 'A Member');
        } else {
          setInvalidCode(true);
        }
      })
      .catch(err => {
        console.error('Error fetching referrer details:', err);
        setInvalidCode(true);
      })
      .finally(() => {
        setLoadingReferrer(false);
      });
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/api/referrals/lead', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        serviceInterest: formData.serviceInterest,
        notes: formData.notes,
        referralCode: code,
        source: 'referral_landing_page'
      });

      if (response.data?.success) {
        setSuccess(true);
        toast.success('Your details registered successfully!');
      } else {
        toast.error(response.data?.message || 'Failed to submit details');
      }
    } catch (err: any) {
      console.error('Lead submission error:', err);
      toast.error(err.response?.data?.message || 'Something went wrong. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingReferrer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-24 pb-12">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Connecting to your referrer...</p>
      </div>
    );
  }

  if (invalidCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-24 pb-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-red-100 shadow-xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={56} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Referral Code</h2>
          <p className="text-gray-600 mb-6">The referral code you followed is not valid or has expired. You can still register directly with us on our homepage.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-600/20">
            Go to Home
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Referrer Banner */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 rounded-full px-5 py-2 text-blue-700 text-sm font-semibold mb-4 shadow-sm">
            <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></span>
            ⚡ Special Invitation
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
            <span className="text-blue-600 font-extrabold">{referrerName}</span> referred you!
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Get professional tax, filing, and business registration services managed by CAs. Register below for custom pricing and dedicated support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-6 md:p-8 bg-blue-600 text-white relative">
              <h2 className="text-xl md:text-2xl font-bold mb-1">Get Started Today</h2>
              <p className="text-blue-100 text-xs md:text-sm">Submit your interest and our expert CA team will contact you.</p>
              
              {/* Decorative accent */}
              <div className="absolute right-6 top-6 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
            </div>

            {success ? (
              <div className="p-8 md:p-12 text-center flex flex-col items-center">
                <CheckCircle2 className="text-green-500 mb-6 animate-bounce" size={68} />
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Registration Successful!</h3>
                <p className="text-gray-600 text-sm leading-relaxed max-w-md mb-8">
                  Thank you for registering. Your referral lead has been submitted to our team under <span className="font-bold text-gray-800">{referrerName}</span>.
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8 w-full text-left">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Next Steps</h4>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">✓ Our representative will call you within 24 hours.</li>
                    <li className="flex items-center gap-2">✓ We will discuss your filing/registration requirements.</li>
                    <li className="flex items-center gap-2">✓ Upon confirmation, your user account will be activated.</li>
                  </ul>
                </div>
                <Link href="/" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition text-center shadow-lg shadow-blue-600/20">
                  Browse Services
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Interested Service *</label>
                  <select
                    name="serviceInterest"
                    value={formData.serviceInterest}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm appearance-none"
                    required
                  >
                    <option value="GST Return Filing">GST Return Filing</option>
                    <option value="GST Registration">GST Registration</option>
                    <option value="Income Tax Return (ITR)">Income Tax Return (ITR)</option>
                    <option value="Company Registration">Company Registration / MSME</option>
                    <option value="Tax Consultation">Tax Consultation / CA Support</option>
                    <option value="Other Compliance">Other Auditing / Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Additional Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Specify any custom requirements or timeline details..."
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm h-24 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition text-center shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider"
                >
                  {submitting ? 'Submitting Details...' : 'Submit Inquiry'}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>

          {/* Benefits Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" size={20} />
                Why file with GSTTaxWale?
              </h3>
              
              <div className="space-y-4">
                {[
                  { title: 'Dedicated CA Support', desc: 'Expert Chartered Accountants review and verify every file to guarantee accuracy.' },
                  { title: 'On-Time Compliance', desc: 'Never miss deadliness. Automated tracking and filing schedules keep you safe from penalties.' },
                  { title: 'Secure Ledger Management', desc: 'All documents, calculations, and receipts are safely archived for easy future downloads.' },
                  { title: 'Transparent Process', desc: 'Complete visibility of filing status and active refund trackers from your personal dashboard.' }
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{benefit.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/30 text-center">
              <h4 className="text-sm font-bold text-blue-900 mb-1">Need Immediate Assistance?</h4>
              <p className="text-xs text-blue-700/80 mb-4">Talk to a tax consultant right now via WhatsApp chat.</p>
              <a href="https://wa.me/918076620573" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-md shadow-green-500/20">
                <MessageSquare size={14} />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
