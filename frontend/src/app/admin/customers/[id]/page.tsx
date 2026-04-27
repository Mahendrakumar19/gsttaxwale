"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { ArrowLeft, Phone, Mail, MapPin, FileText, CreditCard, AlertCircle, Share2 } from 'lucide-react';

export default function AdminCustomerDetails() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;
  
  const [customer, setCustomer] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();

    if (!token || user?.role !== 'admin') {
      router.push('/admin');
      return;
    }

    loadCustomerDetails();
  }, [customerId, router]);

  async function loadCustomerDetails() {
    try {
      const token = adminAuth.getAdminToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://gsttaxwale.com'}/api/admin/customers/${customerId}`,
        config
      );
      setCustomer(res.data.data?.customer);
      setStats(res.data.data?.stats);
    } catch (err) {
      console.error('Failed to load customer', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900 text-xl">Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600 text-xl">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/customers" className="text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
        </div>

        {/* Customer Info Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{customer.name}</h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-amber-400" />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-amber-400" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {(customer.city || customer.state) && (
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-amber-400" />
                    <span>{customer.city}, {customer.state}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase">TAX INFO</h3>
              <div className="space-y-2 text-white">
                <div><span className="text-slate-400">PAN:</span> <span className="font-mono">{customer.pan}</span></div>
                <div><span className="text-slate-400">Status:</span> <span className="capitalize">{customer.status}</span></div>
                <div><span className="text-slate-400">Member Since:</span> <span>{new Date(customer.createdAt).toLocaleDateString()}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-400 mb-2">{stats?.totalTaxFiled || 0}</div>
            <div className="text-slate-400 text-sm">Tax Filings</div>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">₹{Math.round(stats?.totalPaid || 0).toLocaleString()}</div>
            <div className="text-slate-400 text-sm">Total Paid</div>
          </div>
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-400 mb-2">{stats?.totalTickets || 0}</div>
            <div className="text-slate-400 text-sm">Tickets</div>
          </div>
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-amber-400 mb-2">₹{Math.round(stats?.totalReferralCommission || 0).toLocaleString()}</div>
            <div className="text-slate-400 text-sm">Referral Commission</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-700/30 bg-slate-900/20">
            {['overview', 'filings', 'payments', 'tickets', 'referrals'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition ${
                  activeTab === tab
                    ? 'text-gray-900 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-slate-400 text-sm font-semibold mb-2">Contact Information</h4>
                    <div className="space-y-2 text-white">
                      <div><span className="text-slate-500">Email:</span> {customer.email}</div>
                      <div><span className="text-slate-500">Phone:</span> {customer.phone || 'N/A'}</div>
                      <div><span className="text-slate-500">City:</span> {customer.city || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-slate-400 text-sm font-semibold mb-2">Account Status</h4>
                    <div className="space-y-2 text-white">
                      <div><span className="text-slate-500">Status:</span> <span className="capitalize font-semibold">{customer.status}</span></div>
                      <div><span className="text-slate-500">Joined:</span> {new Date(customer.createdAt).toLocaleDateString()}</div>
                      <div><span className="text-slate-500">Total Inquiries:</span> {stats?.totalInquiries || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'filings' && (
              <div>
                {customer.taxFilings && customer.taxFilings.length > 0 ? (
                  <div className="space-y-3">
                    {customer.taxFilings.map((filing: any) => (
                      <div key={filing.id} className="bg-slate-900/50 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <div className="text-white font-semibold">Assessment Year: {filing.assessmentYear}</div>
                          <div className="text-slate-400 text-sm">Tax: ₹{filing.totalTax.toLocaleString()}</div>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${
                          filing.status === 'filed' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                        }`}>
                          {filing.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-8">No tax filings</div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                {customer.payments && customer.payments.length > 0 ? (
                  <div className="space-y-3">
                    {customer.payments.map((payment: any) => (
                      <div key={payment.id} className="bg-slate-900/50 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <div className="text-white font-semibold">₹{payment.amount.toLocaleString()}</div>
                          <div className="text-slate-400 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${
                          payment.status === 'completed' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-8">No payments</div>
                )}
              </div>
            )}

            {activeTab === 'tickets' && (
              <div>
                {customer.tickets && customer.tickets.length > 0 ? (
                  <div className="space-y-3">
                    {customer.tickets.map((ticket: any) => (
                      <Link href={`/admin/tickets/${ticket.id}`} key={ticket.id}>
                        <div className="bg-slate-900/50 rounded-lg p-4 flex justify-between items-center hover:bg-slate-800/50 transition cursor-pointer">
                          <div>
                            <div className="text-white font-semibold">{ticket.subject}</div>
                            <div className="text-slate-400 text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                          </div>
                          <span className={`px-3 py-1 rounded text-sm font-semibold ${
                            ticket.priority === 'urgent' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-8">No tickets</div>
                )}
              </div>
            )}

            {activeTab === 'referrals' && (
              <div>
                {customer.referralsGiven && customer.referralsGiven.length > 0 ? (
                  <div className="space-y-3">
                    {customer.referralsGiven.map((ref: any) => (
                      <div key={ref.id} className="bg-slate-900/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-white font-semibold">{ref.refereeEmail}</div>
                            <div className="text-slate-400 text-sm">{new Date(ref.createdAt).toLocaleDateString()}</div>
                          </div>
                          <span className={`px-3 py-1 rounded text-sm font-semibold ${
                            ref.referralStatus === 'completed' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {ref.referralStatus}
                          </span>
                        </div>
                        <div className="text-amber-400 font-semibold">Commission: ₹{ref.commissionAmount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-8">No referrals</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
