'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { adminAuth } from '@/lib/adminAuth';
import { 
  Users, FileText, ShoppingCart, Ticket, Gift, 
  BarChart3, TrendingUp, Activity, Layout, MapPin, 
  Eye, CheckCircle2, AlertCircle, ChevronRight, Clock, ShieldCheck
} from 'lucide-react';

// Circular Progress Gauge Component
function CircularProgress({ 
  value, 
  label, 
  colorClass, 
  strokeColor 
}: { 
  value: number; 
  label: string; 
  colorClass: string; 
  strokeColor: string;
}) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-150 rounded-[2rem] shadow-sm hover:shadow-md transition duration-300">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-slate-100 fill-transparent"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="fill-transparent transition-all duration-1000 ease-out"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-xl font-black ${colorClass}`}>{value}%</span>
      </div>
      <span className="text-[11px] font-black text-slate-400 mt-4 uppercase tracking-widest text-center">{label}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    services: 0,
    orders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalUsers: 0,
    clients: 0,
    documents: 0,
    tickets: 0,
    visitors: 0,
    referrals: 0,
    rates: {
      tickets: 0,
      orders: 0,
      referrals: 0
    },
    topServices: [],
    pendingTasks: {
      tickets: [],
      orders: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const adminToken = adminAuth.getAdminToken();
    const user = adminAuth.getAdminUser();
    
    if (!adminToken || !user || user.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    
    setAdminUser(user);
    setIsAuthenticated(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadStats() {
      try {
        const response = await api.get('/api/admin/analytics');
        const data = response.data.data || response.data;
        
        setStats({
          services: data.totalServices || 0,
          orders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          pendingOrders: data.pendingOrders || 0,
          totalUsers: data.totalUsers || 0,
          clients: data.totalUsers || 0,
          documents: data.totalDocuments || 0,
          tickets: data.totalTickets || 0,
          visitors: data.totalVisitors || 0,
          referrals: data.totalReferrals || 0,
          rates: data.rates || { tickets: 0, orders: 0, referrals: 0 },
          topServices: data.topServices || [],
          pendingTasks: data.pendingTasks || { tickets: [], orders: [] }
        });
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-slate-500 font-bold text-sm tracking-wide mt-4">Syncing dashboard statistics...</div>
      </div>
    );
  }

  // Quick Action navigation cards
  const quickActions = [
    {
      icon: ShoppingCart,
      label: 'Orders List',
      desc: 'View & process customer files',
      href: '/admin/orders',
      color: 'blue',
      badge: `${stats.pendingOrders} pending`,
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-250',
    },
    {
      icon: Users,
      label: 'Customers',
      desc: 'Manage clients and login permissions',
      href: '/admin/customers',
      color: 'indigo',
      badge: `${stats.totalUsers} registered`,
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-250',
    },
    {
      icon: Gift,
      label: 'Referrals',
      desc: 'Verify reward points and guest leads',
      href: '/admin/referrals',
      color: 'purple',
      badge: `${stats.referrals} referred`,
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-250',
    },
    {
      icon: Ticket,
      label: 'Tickets',
      desc: 'Answer query questions and support tickets',
      href: '/admin/tickets',
      color: 'amber',
      badge: 'Support Desk',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-150',
    },
    {
      icon: Layout,
      label: 'Home Slider',
      desc: 'Update promotional slider images',
      href: '/admin/slider',
      color: 'slate',
      badge: 'CMS Settings',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  ];

  // Dynamic Date string
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Total tasks calculation
  const totalTasksCount = (stats.pendingTasks?.tickets?.length || 0) + (stats.pendingTasks?.orders?.length || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="space-y-2">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{formattedDate}</p>
        <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
          Welcome back, <span className="text-blue-600">{adminUser?.name || 'Administrator'}</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
          Real-time portal activity monitored. The platform currently registers <span className="font-semibold text-slate-800">{stats.totalUsers} customers</span> and <span className="font-semibold text-slate-800">{stats.visitors} total portal visits</span>.
        </p>
      </div>

      {/* Modern Metrics Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1: Visitors */}
        <div className="bg-white border border-slate-150 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Eye size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100/50 border border-emerald-200 px-2 py-0.5 rounded-full">
              +18% W-O-W
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total visits</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats.visitors.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">up from last week</p>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="bg-white border border-slate-150 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <ShoppingCart size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-100/50 border border-blue-200 px-2 py-0.5 rounded-full">
              Live orders
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total orders</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats.orders}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">{stats.pendingOrders} orders await processing</p>
          </div>
        </div>

        {/* Card 3: Revenue */}
        <div className="bg-white border border-slate-150 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <BarChart3 size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-100/50 border border-purple-200 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total revenue</p>
            <p className="text-3xl font-black text-slate-900 mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">gross paid filing collections</p>
          </div>
        </div>

        {/* Card 4: Customers */}
        <div className="bg-white border border-slate-150 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              Steady
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Unique Clients</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats.totalUsers}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">registered user accounts</p>
          </div>
        </div>

      </div>

      {/* Real-time Business Health Gauges & Top Services Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gauges (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-150 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Real-Time Platform Rates</h2>
              <p className="text-xs text-slate-500">Live indicators of service performance and conversions</p>
            </div>
            <div className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 uppercase tracking-wider">
              <Clock size={12} className="animate-spin text-slate-500" />
              Syncing
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CircularProgress 
              value={stats.rates?.tickets || 0} 
              label="Ticket Resolution" 
              colorClass="text-emerald-600" 
              strokeColor="#10b981" 
            />
            <CircularProgress 
              value={stats.rates?.orders || 0} 
              label="Paid Orders Rate" 
              colorClass="text-blue-600" 
              strokeColor="#2563eb" 
            />
            <CircularProgress 
              value={stats.rates?.referrals || 0} 
              label="Referrals Conversion" 
              colorClass="text-purple-600" 
              strokeColor="#8b5cf6" 
            />
          </div>
        </div>

        {/* Top Services Popularity */}
        <div className="bg-white border border-slate-150 rounded-[2.5rem] p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Service Popularity</h2>
            <p className="text-xs text-slate-500 mb-6">Popular tax services ordered by customer accounts</p>
          </div>
          
          <div className="space-y-4">
            {stats.topServices?.length === 0 ? (
              <p className="text-slate-400 text-sm italic">No services orders recorded yet.</p>
            ) : (
              stats.topServices.map((srv: any, index: number) => {
                const maxCount = Math.max(...stats.topServices.map((s: any) => s.count), 1);
                const pct = Math.round((srv.count / maxCount) * 100);
                const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-indigo-500', 'bg-purple-500'];
                
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span className="capitalize">{srv.name?.replace(/-/g, ' ') || 'Other Service'}</span>
                      <span>{srv.count} orders ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${colors[index % colors.length]}`} 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="pt-4 border-t border-slate-100 text-center">
            <Link 
              href="/admin/services" 
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1"
            >
              Manage Services catalog <ChevronRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* Actionable To-do Checklist & Quick Navigation links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* To-do List (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-150 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Action Tasks Todo List
              {totalTasksCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200">
                  {totalTasksCount} Actionable
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">Urgent orders and tickets that require administrative response</p>
          </div>

          <div className="space-y-3">
            {totalTasksCount === 0 ? (
              <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-6 text-center text-slate-500 space-y-2">
                <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                <p className="font-extrabold text-slate-800">All caught up!</p>
                <p className="text-xs">No pending orders or open support tickets currently require your attention.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/20">
                {/* Orders Todo */}
                {stats.pendingTasks?.orders?.map((ord: any) => (
                  <div key={`order-${ord.id}`} className="p-4 flex items-center justify-between text-sm hover:bg-slate-50 transition">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        readOnly 
                        checked={false} 
                        onClick={() => router.push(`/admin/orders`)}
                        className="mt-1 w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer" 
                      />
                      <div>
                        <p className="font-bold text-slate-900">Process service order #{ord.id}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-0.5">Service: {ord.serviceName?.replace(/-/g, ' ')}</p>
                      </div>
                    </div>
                    <Link 
                      href={`/admin/orders`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 border border-slate-200 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 transition shadow-sm"
                    >
                      Process Order
                    </Link>
                  </div>
                ))}

                {/* Support Tickets Todo */}
                {stats.pendingTasks?.tickets?.map((tkt: any) => (
                  <div key={`ticket-${tkt.id}`} className="p-4 flex items-center justify-between text-sm hover:bg-slate-50 transition">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        readOnly 
                        checked={false} 
                        onClick={() => router.push(`/admin/tickets/${tkt.id}`)}
                        className="mt-1 w-4 h-4 text-amber-600 bg-white border-slate-300 rounded focus:ring-amber-500 cursor-pointer" 
                      />
                      <div>
                        <p className="font-bold text-slate-900">Reply to ticket: {tkt.title}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-0.5">Category: {tkt.category}</p>
                      </div>
                    </div>
                    <Link 
                      href={`/admin/tickets/${tkt.id}`}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl bg-amber-50/50 hover:bg-amber-100/50 transition shadow-sm"
                    >
                      View Ticket
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Info card */}
        <div className="bg-white border border-slate-150 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={22} />
              Session Details
            </h2>
            <p className="text-xs text-slate-500">Security audit parameters of the active admin console</p>
          </div>

          <div className="space-y-4 font-sans text-xs">
            <div className="border-l-4 border-blue-500 pl-4 py-0.5">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Admin Username</p>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">{adminUser?.name || 'Administrator'}</p>
            </div>
            <div className="border-l-4 border-emerald-500 pl-4 py-0.5">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Admin Email</p>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5 truncate">{adminUser?.email || 'admin@gsttaxwale.com'}</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-0.5">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Portal Security Level</p>
              <p className="text-sm font-extrabold text-purple-700 mt-0.5">Root Administrator (Level 1)</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link 
              href="/admin/settings" 
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition inline-flex items-center gap-1"
            >
              Configure Portal Settings <ChevronRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900">Workspace Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white border border-slate-150 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition duration-200 flex flex-col justify-between min-h-[140px]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-600">
                    <action.icon size={18} />
                  </div>
                  <span className={`text-[9px] font-black border uppercase tracking-wider px-2 py-0.5 rounded ${action.badgeColor}`}>
                    {action.badge}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-950 mb-1">{action.label}</h3>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
