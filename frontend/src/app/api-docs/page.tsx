"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Lock, Globe, Shield, Terminal, Search, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth: 'Public' | 'Authenticated' | 'Admin Only';
  params?: string[];
  body?: string[];
}

interface Category {
  name: string;
  icon: React.ReactNode;
  endpoints: Endpoint[];
}

const API_CATEGORIES: Category[] = [
  {
    name: 'Authentication & Profile',
    icon: <Lock className="w-5 h-5" />,
    endpoints: [
      { method: 'POST', path: '/api/auth/login', description: 'Log in to user account', auth: 'Public', body: ['email', 'password'] },
      { method: 'POST', path: '/api/auth/admin-login', description: 'Log in to admin dashboard', auth: 'Public', body: ['email', 'password'] },
      { method: 'POST', path: '/api/auth/send-otp', description: 'Send OTP for verification', auth: 'Public', body: ['phone'] },
      { method: 'POST', path: '/api/auth/verify-otp', description: 'Verify OTP code', auth: 'Public', body: ['phone', 'otp'] },
      { method: 'GET', path: '/api/auth/me', description: 'Get current user profile', auth: 'Authenticated' },
      { method: 'PUT', path: '/api/auth/profile', description: 'Update user profile details', auth: 'Authenticated', body: ['name', 'phone', 'pan', 'aadhaar', 'address'] },
      { method: 'POST', path: '/api/auth/logout', description: 'Log out current user', auth: 'Authenticated' },
    ]
  },
  {
    name: 'Services & Pricing',
    icon: <Globe className="w-5 h-5" />,
    endpoints: [
      { method: 'GET', path: '/api/services', description: 'Get all active services', auth: 'Public' },
      { method: 'GET', path: '/api/services/:id', description: 'Get detailed information for a specific service', auth: 'Public', params: ['id (ID or Slug)'] },
      { method: 'GET', path: '/api/pricing/active', description: 'Get active pricing for frontend display', auth: 'Public' },
      { method: 'GET', path: '/api/due-dates', description: 'Get all tax due dates (GST & ITR)', auth: 'Public' },
      { method: 'GET', path: '/api/news', description: 'Get latest tax news and updates', auth: 'Public', params: ['limit', 'category'] },
    ]
  },
  {
    name: 'User Dashboard',
    icon: <Terminal className="w-5 h-5" />,
    endpoints: [
      { method: 'GET', path: '/api/dashboard', description: 'Get comprehensive dashboard data', auth: 'Authenticated' },
      { method: 'GET', path: '/api/dashboard/filing-status', description: 'Get current tax filing progress', auth: 'Authenticated' },
      { method: 'GET', path: '/api/dashboard/services', description: 'Get services purchased by the user', auth: 'Authenticated' },
      { method: 'GET', path: '/api/dashboard/documents', description: 'Get user documents grouped by category', auth: 'Authenticated' },
      { method: 'GET', path: '/api/dashboard/wallet', description: 'Get user wallet balance and points', auth: 'Authenticated' },
    ]
  },
  {
    name: 'Documents & Uploads',
    icon: <Terminal className="w-5 h-5" />,
    endpoints: [
      { method: 'GET', path: '/api/documents', description: 'List all user documents (Grouped)', auth: 'Authenticated' },
      { method: 'POST', path: '/api/documents/upload', description: 'Upload a document (Client-side)', auth: 'Authenticated', body: ['file (Multipart)'] },
      { method: 'DELETE', path: '/api/documents/:documentId', description: 'Delete a document', auth: 'Authenticated', params: ['documentId'] },
      { method: 'POST', path: '/api/admin/upload-document', description: 'Upload document for a specific user', auth: 'Admin Only', body: ['file', 'userId', 'category', 'fiscalYear'] },
    ]
  },
  {
    name: 'Orders & Payments',
    icon: <Shield className="w-5 h-5" />,
    endpoints: [
      { method: 'POST', path: '/api/orders', description: 'Create a new order (Razorpay)', auth: 'Authenticated', body: ['serviceId', 'amount'] },
      { method: 'POST', path: '/api/orders/verify', description: 'Verify Razorpay payment signature', auth: 'Public', body: ['orderId', 'paymentId', 'signature'] },
      { method: 'GET', path: '/api/orders', description: 'List user orders', auth: 'Authenticated' },
      { method: 'GET', path: '/api/orders/:id', description: 'Get specific order details', auth: 'Authenticated', params: ['id'] },
      { method: 'POST', path: '/api/orders/create-inquiry', description: 'Create a free service inquiry', auth: 'Public', body: ['name', 'email', 'phone', 'serviceId'] },
    ]
  },
  {
    name: 'Referrals & Rewards',
    icon: <Terminal className="w-5 h-5" />,
    endpoints: [
      { method: 'GET', path: '/api/referrals/link', description: 'Get shareable referral link', auth: 'Authenticated' },
      { method: 'POST', path: '/api/referrals/redeem-points', description: 'Request points redemption', auth: 'Authenticated', body: ['points'] },
      { method: 'GET', path: '/api/referrals/history', description: 'Get points and redemption history', auth: 'Authenticated' },
      { method: 'POST', path: '/api/referrals/generate-public', description: 'Generate public referral for leads', auth: 'Public', body: ['name', 'email', 'phone'] },
    ]
  },
  {
    name: 'Admin Management',
    icon: <Shield className="w-5 h-5" />,
    endpoints: [
      { method: 'GET', path: '/api/admin/stats', description: 'Get global admin statistics', auth: 'Admin Only' },
      { method: 'GET', path: '/api/admin/users', description: 'List all platform users', auth: 'Admin Only' },
      { method: 'POST', path: '/api/admin/users', description: 'Create a new user manually', auth: 'Admin Only', body: ['name', 'email', 'password', 'role'] },
      { method: 'PUT', path: '/api/admin/services/:id', description: 'Update service details', auth: 'Admin Only', params: ['id'], body: ['title', 'price', 'discountedPrice'] },
      { method: 'PUT', path: '/api/admin/update-filing-status', description: 'Update a user\'s filing progress', auth: 'Admin Only', body: ['userId', 'status', 'serviceId'] },
      { method: 'PUT', path: '/api/admin/points/:userId', description: 'Manually adjust user points', auth: 'Admin Only', params: ['userId'], body: ['points', 'type', 'reason'] },
      { method: 'POST', path: '/api/admin/redeem-requests/:id/approve', description: 'Approve a redemption request', auth: 'Admin Only', params: ['id'] },
    ]
  },
  {
    name: 'Locations & News',
    icon: <Globe className="w-5 h-5" />,
    endpoints: [
      { method: 'GET', path: '/api/locations', description: 'List all operational office locations', auth: 'Public' },
      { method: 'GET', path: '/api/due-dates', description: 'Get upcoming tax deadlines', auth: 'Public' },
      { method: 'GET', path: '/api/news', description: 'Fetch latest GST and tax news', auth: 'Public', params: ['limit', 'category'] },
    ]
  }
];

export default function ApiDocsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(API_CATEGORIES[0].name);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    toast.success('Path copied to clipboard');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const filteredCategories = API_CATEGORIES.map(cat => ({
    ...cat,
    endpoints: cat.endpoints.filter(e => 
      e.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.endpoints.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 sticky top-0 h-screen overflow-y-auto hidden lg:block">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Terminal className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">API Reference</h1>
          </div>

          <nav className="space-y-1">
            {API_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.name 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 lg:px-12 py-12">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">API Documentation</h2>
              <p className="text-slate-500 mt-2 text-lg">Detailed reference for all GST Tax Wale endpoints</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition shadow-sm outline-none"
              />
            </div>
          </div>

          <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Base URL
            </h3>
            <div className="bg-blue-900/30 p-4 rounded-xl flex items-center justify-between font-mono text-sm border border-white/10">
              <code>https://gsttaxwale.com/api</code>
              <button onClick={() => copyToClipboard('https://gsttaxwale.com/api')} className="hover:text-blue-300 transition">
                {copiedPath === 'https://gsttaxwale.com/api' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-4 text-blue-100 text-sm">
              All requests must include <code>Content-Type: application/json</code>. 
              Authenticated routes require a Bearer Token in the <code>Authorization</code> header.
            </p>
          </div>
        </header>

        <div className="space-y-20">
          {filteredCategories.map((cat) => (
            <section key={cat.name} id={cat.name.toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-slate-200 p-3 rounded-2xl text-slate-600">
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{cat.name}</h3>
              </div>

              <div className="space-y-6">
                {cat.endpoints.map((endpoint, idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                          endpoint.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-bold text-slate-700">{endpoint.path}</code>
                        <button onClick={() => copyToClipboard(endpoint.path)} className="text-slate-300 hover:text-slate-600 transition">
                          {copiedPath === endpoint.path ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          endpoint.auth === 'Public' ? 'bg-slate-100 text-slate-500' :
                          endpoint.auth === 'Admin Only' ? 'bg-purple-100 text-purple-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {endpoint.auth}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 bg-slate-50/30">
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">{endpoint.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {endpoint.params && (
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Path Parameters</h4>
                            <div className="flex flex-wrap gap-2">
                              {endpoint.params.map(p => (
                                <span key={p} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono">{p}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {endpoint.body && (
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Request Body</h4>
                            <div className="flex flex-wrap gap-2">
                              {endpoint.body.map(b => (
                                <span key={b} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-mono border border-blue-100">{b}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
