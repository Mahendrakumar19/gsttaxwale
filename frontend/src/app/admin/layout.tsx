'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminAuth } from '@/lib/adminAuth';
import Link from 'next/link';
import {
  LogOut, Menu, X, LayoutDashboard, Users, FileText,
  ShoppingCart, Ticket, Gift, Settings, Home, MapPin,
  Layout, Search, Bell, MessageSquare, Moon, Sun, ChevronRight, User
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
      ]
    },
    {
      title: 'Communications',
      items: [
        { icon: Ticket, label: 'Support Tickets', href: '/admin/tickets' },
        { icon: Gift, label: 'Referrals', href: '/admin/referrals' },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
      ]
    }
  ];

  // Breadcrumb generator
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const isLast = index === parts.length - 1;
      const label = part.charAt(0).toUpperCase() + part.slice(1);
      return (
        <div key={part} className="flex items-center">
          {index > 0 && <ChevronRight size={14} className="text-slate-400 mx-2" />}
          <span className={`text-sm ${isLast ? 'text-slate-800 font-black' : 'text-slate-400 font-medium'}`}>
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
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'} text-slate-800 flex transition-colors duration-200`}>

      {/* Sidebar Navigation - Fixed position */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-white border-r border-slate-150 transition-all duration-300 overflow-hidden flex flex-col shrink-0 fixed h-screen top-0 left-0 z-40`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/admin/dashboard">
            <img src="/gsttaxwale_logo.svg" alt="TaxWale Logo" className="h-14 w-auto hover:opacity-90 transition-opacity" />
          </Link>
        </div>
        {/* Menu Items Container */}
        <nav className="flex-1 py-6 overflow-y-auto space-y-6">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <h3 className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 mx-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold relative ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-600 rounded-r-md"></div>
                      )}
                      <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin Profile Widget */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md shrink-0">
              {getInitials(adminUser?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-slate-900 truncate">{adminUser?.name || 'Administrator'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Role</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area — uses margin-left to stay right of fixed sidebar */}
      <div
        className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >

        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-150 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
          {/* Left Actions & Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 transition"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              {getBreadcrumbs()}
            </div>
          </div>
        </header>

        {/* Dynamic Page Router Children */}
        <main className="flex-1 bg-slate-50 overflow-x-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
