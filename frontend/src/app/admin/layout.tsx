'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminAuth } from '@/lib/adminAuth';
import Link from 'next/link';
import {
  LogOut, Menu, X, LayoutDashboard, Users, FileText,
  ShoppingCart, Ticket, Gift, Settings, Home, MapPin,
  Layout, ChevronRight, MessageSquare, Newspaper, Award,
  UserCheck, BarChart3
} from 'lucide-react';

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true); // Auto-open on desktop
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set sidebar open by default on desktop
  useEffect(() => {
    if (!isMobile) setSidebarOpen(true);
  }, [isMobile]);

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = adminAuth.getAdminToken();
      const user = adminAuth.getAdminUser();

      if (!token && sessionStorage.getItem('token')) {
        const userData = sessionStorage.getItem('user');
        const userToken = sessionStorage.getItem('token');
        if (userData && userToken) {
          try {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.role === 'admin') {
              adminAuth.setAdminToken(userToken);
              adminAuth.setAdminUser(parsedUser);
              setAdminUser(parsedUser);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error('Error parsing user data:', err);
          }
        }
      }

      if (!token || user?.role !== 'admin') {
        router.push('/auth/login');
        return;
      }

      setAdminUser(user);
      setLoading(false);
    };

    checkAdminAuth();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    adminAuth.clearAdmin();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-500 font-bold text-sm tracking-wide">Loading workspace...</div>
        </div>
      </div>
    );
  }

  // Sidebar Menu Categorized Sections
  const menuSections = [
    {
      title: 'Workspace',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
        { icon: Users, label: 'Customers', href: '/admin/customers' },
        { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
        { icon: FileText, label: 'Documents', href: '/admin/documents' },
      ]
    },
    {
      title: 'Offerings',
      items: [
        { icon: Home, label: 'Services', href: '/admin/services' },
        { icon: MapPin, label: 'Store Locations', href: '/admin/locations' },
        { icon: Layout, label: 'Slider Images', href: '/admin/slider' },
        { icon: Newspaper, label: 'News', href: '/admin/news' },
      ]
    },
    {
      title: 'Communications',
      items: [
        { icon: Ticket, label: 'Support Tickets', href: '/admin/tickets' },
        { icon: Gift, label: 'Referrals', href: '/admin/referrals' },
        { icon: UserCheck, label: 'Referral Leads', href: '/admin/referral-leads' },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
        { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
      ]
    }
  ];

  // Breadcrumb generator
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const isLast = index === parts.length - 1;
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      return (
        <div key={part} className="flex items-center">
          {index > 0 && <ChevronRight size={14} className="text-slate-400 mx-1 sm:mx-2" />}
          <span className={`text-xs sm:text-sm ${isLast ? 'text-slate-800 font-black' : 'text-slate-400 font-medium'}`}>
            {label}
          </span>
        </div>
      );
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'AD';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">

      {/* Mobile Overlay Backdrop */}
      {sidebarOpen && isMobile && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
          bg-white border-r border-slate-150 flex flex-col shrink-0
          fixed h-screen top-0 left-0 z-40
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}
          lg:translate-x-0
          ${!sidebarOpen && !isMobile ? 'lg:w-0 lg:-translate-x-full lg:overflow-hidden' : ''}
          ${sidebarOpen && !isMobile ? 'lg:w-64' : ''}
        `}
        style={{ minWidth: sidebarOpen || !isMobile ? undefined : 0 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
          <Link href="/admin/dashboard" className="flex-1 min-w-0">
            <img src="/gsttaxwale_logo.svg" alt="TaxWale Logo" className="h-10 sm:h-14 w-auto hover:opacity-90 transition-opacity" />
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-2 p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Items Container */}
        <nav className="flex-1 py-4 sm:py-6 overflow-y-auto space-y-4 sm:space-y-6">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-4 sm:px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 mx-2 sm:mx-3 px-3 sm:px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold relative ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-600 rounded-r-md"></div>
                      )}
                      <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin Profile Widget */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md shrink-0">
              {getInitials(adminUser?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{adminUser?.name || 'Administrator'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Role</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 sm:p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`
          flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300
          ${sidebarOpen && !isMobile ? 'lg:pl-64' : 'lg:pl-0'}
        `}
      >
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-150 sticky top-0 z-30 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm">
          {/* Left: Hamburger + Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 transition shrink-0"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen && !isMobile ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden sm:flex items-center gap-1 min-w-0 overflow-hidden">
              {getBreadcrumbs()}
            </div>
            {/* Mobile: show only current page name */}
            <div className="sm:hidden text-sm font-bold text-slate-800 truncate">
              {pathname.split('/').filter(Boolean).pop()?.charAt(0).toUpperCase()}{pathname.split('/').filter(Boolean).pop()?.slice(1).replace(/-/g, ' ')}
            </div>
          </div>

          {/* Right: Admin info */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-slate-700">{adminUser?.name}</p>
              <p className="text-[10px] text-slate-400">Administrator</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              {getInitials(adminUser?.name)}
            </div>
          </div>
        </header>

        {/* Dynamic Page Router Children */}
        <main className="flex-1 bg-slate-50 overflow-x-hidden">
          {children}
        </main>
      </div>

    </div>
  );
}
