"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { adminAuth } from '@/lib/adminAuth';
import { 
  Users, Mail, Phone, Calendar, CheckCircle2, XCircle, 
  Search, Eye, Edit, UserCheck, AlertCircle, RefreshCw, X, MessageSquare 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReferralLeads() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0 });
  const [refreshing, setRefreshing] = useState(false);

  // Detail Modal State
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadEvents, setLeadEvents] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [updatingLead, setUpdatingLead] = useState(false);

  // Conversion Success Modal State
  const [credentials, setCredentials] = useState<any>(null);

  useEffect(() => {
    const token = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();
    if (!token || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    loadLeads();
  }, [router, statusFilter, pagination.offset]);

  async function loadLeads() {
    setRefreshing(true);
    try {
      const token = adminAuth.getAdminToken();
      const config = { 
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter || undefined,
          search: search || undefined,
          limit: pagination.limit,
          offset: pagination.offset
        }
      };
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/referral-leads`,
        config
      );
      if (res.data.success) {
        setLeads(res.data.data?.leads || []);
        setPagination(prev => ({
          ...prev,
          total: res.data.data?.pagination?.total || 0
        }));
      }
    } catch (err: any) {
      console.error('Failed to load leads', err);
      toast.error('Failed to load referral leads');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, offset: 0 }));
    loadLeads();
  };

  const viewLeadDetails = async (lead: any) => {
    try {
      const token = adminAuth.getAdminToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/referral-leads/${lead.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSelectedLead(res.data.data.lead);
        setLeadEvents(res.data.data.events || []);
        setNotes(res.data.data.lead.notes || '');
        setStatusInput(res.data.data.lead.status);
      }
    } catch (err) {
      console.error('Error fetching lead details:', err);
      toast.error('Failed to fetch lead details');
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setUpdatingLead(true);
    try {
      const token = adminAuth.getAdminToken();
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/referral-leads/${selectedLead.id}`,
        { status: statusInput, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success('Lead updated successfully');
        loadLeads();
        // Refresh details modal context
        setSelectedLead((prev: any) => ({ ...prev, status: statusInput, notes }));
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      toast.error('Failed to update lead');
    } finally {
      setUpdatingLead(false);
    }
  };

  const handleConvertLead = async (leadId: number) => {
    if (!window.confirm('Are you sure you want to convert this referral lead into an active Customer? This will auto-create their login credentials.')) {
      return;
    }
    try {
      const token = adminAuth.getAdminToken();
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/referral-leads/${leadId}/convert`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success('Lead converted to Customer successfully!');
        setCredentials(res.data.data);
        setSelectedLead(null); // Close detail modal
        loadLeads();
      }
    } catch (err: any) {
      console.error('Conversion failed:', err);
      toast.error(err.response?.data?.message || 'Failed to convert lead to customer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="text-blue-600" size={28} />
              Referral Leads Onboarding
            </h1>
            <p className="text-gray-500 text-sm mt-1">Review referral inquiries, coordinate CA assignments, and convert to active customers.</p>
          </div>
          
          <button 
            onClick={loadLeads}
            disabled={refreshing}
            className="self-start md:self-auto flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 border border-gray-200 rounded-xl transition shadow-sm text-sm"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Controls Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex gap-1.5 flex-wrap w-full lg:w-auto">
            {[
              { label: 'All Leads', value: '' },
              { label: 'Pending', value: 'pending' },
              { label: 'Contacted', value: 'contacted' },
              { label: 'Converted', value: 'converted' },
              { label: 'Rejected', value: 'rejected' }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPagination(prev => ({ ...prev, offset: 0 })); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  statusFilter === tab.value
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-150'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full lg:w-96">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Leads Table */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium text-sm">Loading referral leads pipeline...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
            <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-semibold text-lg">No referral leads found</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Guest Lead</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Service Interest</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Referrer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Submission Date</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-sm">{lead.guest_name}</div>
                        <div className="text-gray-500 text-xs mt-0.5 flex flex-col gap-0.5">
                          <span className="flex items-center gap-1"><Mail size={12} /> {lead.guest_email}</span>
                          <span className="flex items-center gap-1"><Phone size={12} /> {lead.guest_phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-100">
                          {lead.service_interest || 'General filing'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800 text-sm">{lead.referrerName}</div>
                        <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">{lead.referrerEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          lead.status === 'converted'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : lead.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : lead.status === 'contacted'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {lead.status === 'converted' && <CheckCircle2 size={10} />}
                          {lead.status === 'rejected' && <XCircle size={10} />}
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(lead.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => viewLeadDetails(lead)}
                            className="p-2 bg-gray-50 hover:bg-gray-150 text-gray-700 rounded-lg transition border border-gray-200"
                            title="View Details & Update"
                          >
                            <Eye size={14} />
                          </button>
                          {lead.status !== 'converted' && (
                            <button
                              onClick={() => handleConvertLead(lead.id)}
                              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition border border-blue-200"
                              title="Convert to Customer"
                            >
                              <UserCheck size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lead Detail Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-[1.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Lead Profile Details</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Reference ID: #{selectedLead.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* Status Alert Banner */}
                <div className={`p-4 rounded-2xl border text-sm flex items-center justify-between ${
                  selectedLead.status === 'converted'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : selectedLead.status === 'rejected'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                  <span className="font-semibold capitalize">Current Status: {selectedLead.status}</span>
                  {selectedLead.status !== 'converted' && (
                    <button 
                      onClick={() => handleConvertLead(selectedLead.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-bold text-xs shadow-md shadow-blue-600/10 cursor-pointer"
                    >
                      Convert Customer
                    </button>
                  )}
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Lead Information */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/60">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Guest Details</h4>
                    <div className="space-y-2.5 text-sm text-gray-700">
                      <p><strong className="text-gray-900">Name:</strong> {selectedLead.guest_name}</p>
                      <p><strong className="text-gray-900">Email:</strong> {selectedLead.guest_email}</p>
                      <p><strong className="text-gray-900">Phone:</strong> {selectedLead.guest_phone}</p>
                      <p><strong className="text-gray-900">Interested Service:</strong> {selectedLead.service_interest}</p>
                      <p><strong className="text-gray-900">Attribution Token:</strong> <span className="font-mono text-xs text-gray-500 break-all select-all">{selectedLead.attribution_token || '—'}</span></p>
                    </div>
                  </div>

                  {/* Referrer Information */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/60">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Referrer (Affiliate)</h4>
                    <div className="space-y-2.5 text-sm text-gray-700">
                      <p><strong className="text-gray-900">Referrer ID:</strong> #{selectedLead.referrer_user_id}</p>
                      <p><strong className="text-gray-900">Name:</strong> {selectedLead.referrerName}</p>
                      <p><strong className="text-gray-900">Email:</strong> {selectedLead.referrerEmail}</p>
                      <p><strong className="text-gray-900">Phone:</strong> {selectedLead.referrerPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleUpdateLead} className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Update Pipeline State</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Workflow Status</label>
                      <select
                        value={statusInput}
                        onChange={(e) => setStatusInput(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:bg-white"
                        disabled={selectedLead.status === 'converted'}
                      >
                        <option value="pending">Pending Review</option>
                        <option value="contacted">Contacted / CA Assigned</option>
                        <option value="rejected">Rejected / Invalid Lead</option>
                        {selectedLead.status === 'converted' && <option value="converted">Converted Customer</option>}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Action notes / comments</label>
                      <input 
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Assigning CA, pricing quote details, etc..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-250 rounded-xl text-sm focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={updatingLead}
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
                  >
                    {updatingLead ? 'Saving Changes...' : 'Save Lead Notes'}
                  </button>
                </form>

                {/* Lead Events History (Timeline) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Interaction & Attribution History</h4>
                  {leadEvents.length === 0 ? (
                    <p className="text-gray-400 text-xs italic">No tracking events recorded for this lead.</p>
                  ) : (
                    <div className="border border-gray-150 rounded-2xl overflow-hidden divide-y divide-gray-100 bg-gray-50/20">
                      {leadEvents.map((evt) => (
                        <div key={evt.id} className="p-3 text-xs flex items-start gap-4">
                          <span className={`inline-block font-mono px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            evt.event_type === 'conversion'
                              ? 'bg-green-100 text-green-700'
                              : evt.event_type === 'form_submit'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {evt.event_type}
                          </span>
                          <div className="flex-1 text-gray-600 leading-relaxed">
                            <p className="font-semibold text-gray-800">{evt.event_type === 'form_submit' ? 'Guest submitted intake form' : evt.event_type === 'conversion' ? 'CA Approved Lead Conversion' : evt.event_type}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              IP: {evt.ip_address || 'Unknown'} | Agent: {evt.user_agent ? evt.user_agent.slice(0, 75) + '...' : 'Unknown'}
                            </p>
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium text-right shrink-0">
                            {new Date(evt.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Credentials / Conversion Success Modal */}
        {credentials && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative overflow-hidden text-center">
              <CheckCircle2 className="mx-auto text-green-500 mb-4 animate-bounce" size={64} />
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">Lead Converted!</h3>
              <p className="text-gray-500 text-sm mb-6">The user account has been successfully created. Onboarding credentials have been generated:</p>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left font-mono text-sm space-y-2 mb-6">
                <div>
                  <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider font-sans">Login Email</span>
                  <span className="font-bold text-gray-800 select-all">{credentials.email}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider font-sans">Temporary Password</span>
                  <span className="font-bold text-blue-600 select-all">{credentials.password}</span>
                </div>
              </div>

              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                An email notification has been dispatched to <span className="font-semibold text-gray-600">{credentials.email}</span> with these credentials and a link to log in.
              </p>

              <button 
                onClick={() => setCredentials(null)}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition uppercase tracking-wider text-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
