'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminAuth } from '@/lib/adminAuth';
import Link from 'next/link';
import { LogOut, Menu, X, LayoutDashboard, Users, FileText, ShoppingCart, Ticket, Gift, Settings, Home, Phone, MapPin, Layout } from 'lucide-react';

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600 text-lg">Loading admin panel…</div>
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
    { icon: FileText, label: 'Documents', href: '/admin/documents' },
    { icon: Home, label: 'Services', href: '/admin/services' },
    { icon: MapPin, label: 'Store Locations', href: '/admin/locations' },
    { icon: Layout, label: 'Slider Management', href: '/admin/slider' },
    { icon: Ticket, label: 'Support Tickets', href: '/admin/tickets' },
    { icon: Gift, label: 'Referrals', href: '/admin/referrals' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100]">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-900 active:scale-95"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="p-1.5 bg-blue-600 rounded-lg group-hover:rotate-6 transition-transform">
                <LayoutDashboard className="text-white" size={20} />
              </div>
              <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">GST Admin <span className="text-blue-600">PRO</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 border-r border-slate-100 pr-6 mr-2">
               <Link href="/" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition">View Site</Link>
               <Link href="/contact" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition">Support</Link>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{adminUser?.name || 'Administrator'}</p>
                <div className="flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Master Auth</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-red-600 transition-all shadow-sm active:scale-95"
                title="Secure Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100-73px)]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-72' : 'w-0'
          } bg-white border-r border-slate-100 transition-all duration-500 ease-in-out overflow-hidden z-40 sticky top-[73px] h-[calc(100vh-73px)]`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="mb-6">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Systems</p>
              <nav className="space-y-1.5">
                {menuItems.slice(0, 5).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-slate-50 hover:text-blue-600 transition-all text-sm font-black text-slate-900 uppercase tracking-tight group"
                  >
                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                      <item.icon size={18} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex-1">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Operations</p>
              <nav className="space-y-1.5">
                {menuItems.slice(5).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-slate-50 hover:text-blue-600 transition-all text-sm font-black text-slate-900 uppercase tracking-tight group"
                  >
                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                      <item.icon size={18} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-50">
               <div className="p-4 bg-blue-600 rounded-[2rem] text-white relative overflow-hidden group cursor-help">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">System Health</p>
                  <p className="text-sm font-black uppercase tracking-tight">Status: Nominal</p>
               </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-slate-50/50 min-h-screen">
          <div className="animate-in fade-in slide-in-from-right-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
  );
}
