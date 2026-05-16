'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminAuth } from '@/lib/adminAuth';
import Link from 'next/link';
import { LogOut, Menu, X, LayoutDashboard, Users, FileText, ShoppingCart, Ticket, Gift, Settings, Home, Phone, MapPin, Layout, MessageSquare } from 'lucide-react';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initializing Admin Secure-Link...</p>
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Control Center', href: '/admin/dashboard' },
    { icon: Users, label: 'Identity Directory', href: '/admin/users' },
    { icon: ShoppingCart, label: 'Transactions', href: '/admin/orders' },
    { icon: FileText, label: 'GST Entity Master', href: '/admin/gst-clients' },
    { icon: Layout, label: 'Digital Assets', href: '/admin/slider' },
    { icon: Ticket, label: 'Support Ledger', href: '/admin/tickets' },
    { icon: Home, label: 'Service Portfolio', href: '/admin/services' },
    { icon: MapPin, label: 'Physical Network', href: '/admin/locations' },
    { icon: MessageSquare, label: 'Newsroom', href: '/admin/news' },
    { icon: Settings, label: 'System Protocols', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-[100] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between px-10 py-5">
          <div className="flex items-center gap-10">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-slate-100"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/admin/dashboard" className="flex items-center gap-4 group">
              <div className="p-2.5 bg-slate-900 rounded-xl shadow-xl group-hover:scale-105 transition-transform duration-500">
                <LayoutDashboard className="text-white" size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 tracking-tight leading-tight">GST TAX WALE</span>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] leading-none mt-1">Institutional Administration</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-10">
            <div className="hidden xl:flex items-center gap-8 border-r border-slate-50 pr-10">
               <Link href="/" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-[0.3em] transition-all flex items-center gap-2">
                  <Home size={12} />
                  Access Public Layer
               </Link>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 tracking-tight">{adminUser?.name || 'Administrator'}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center justify-end gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-slate-400" />
                   Security Clear Level 4
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-900 shadow-sm transition-all hover:border-slate-900">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 active:scale-90"
                title="Terminate Session"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-81px)]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-80' : 'w-0'
          } bg-white border-r border-slate-100 transition-all duration-500 ease-in-out overflow-hidden z-40 sticky top-[81px] h-[calc(100vh-81px)]`}
        >
          <div className="p-8 h-full flex flex-col">
            <nav className="space-y-10">
              <div>
                <p className="px-5 text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-6">Strategic Matrix</p>
                <div className="space-y-1.5">
                  {menuItems.slice(0, 4).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3.5 px-5 py-3 rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-all text-xs font-bold text-slate-400 group border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md"
                    >
                      <item.icon size={18} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
                      <span className="tracking-tight uppercase">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="px-5 text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-6">Operational Nodes</p>
                <div className="space-y-1.5">
                  {menuItems.slice(4, 8).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3.5 px-5 py-3 rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-all text-xs font-bold text-slate-400 group border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md"
                    >
                      <item.icon size={18} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
                      <span className="tracking-tight uppercase">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="px-5 text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-6">Governance Layer</p>
                <div className="space-y-1.5">
                  {menuItems.slice(8).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3.5 px-5 py-3 rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-all text-xs font-bold text-slate-400 group border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md"
                    >
                      <item.icon size={18} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
                      <span className="tracking-tight uppercase">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            <div className="mt-auto pt-10">
              <div className="p-6 bg-slate-900 rounded-3xl shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Protocol State</p>
                </div>
                <p className="text-[11px] font-bold text-white tracking-tight leading-tight">Institutional Sync Active</p>
                <div className="mt-4 w-full bg-white/10 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-white h-full w-[92%] transition-all duration-2000" />
                </div>
                <p className="mt-4 text-[8px] font-bold text-slate-500 uppercase tracking-[0.5em]">v4.20 STABLE-REL</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-[#FDFDFD] overflow-y-auto">
          <div className="p-12 max-w-[1700px] mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
