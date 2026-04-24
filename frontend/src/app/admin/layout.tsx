'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminAuth } from '@/lib/adminAuth';
import Link from 'next/link';
import { LogOut, Menu, X, LayoutDashboard, Users, FileText, ShoppingCart, Ticket, Gift, Settings, Home, Phone } from 'lucide-react';

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
    { icon: FileText, label: 'Documents', href: '/admin/documents' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
    { icon: Home, label: 'Services', href: '/admin/services' },
    { icon: Ticket, label: 'Support Tickets', href: '/admin/tickets' },
    { icon: Gift, label: 'Referrals', href: '/admin/referrals' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-900"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">₹</div>
              <span className="text-lg font-bold text-gray-900 hidden sm:inline">GST Admin</span>
            </Link>
            <div className="hidden sm:flex items-center gap-6 ml-8">
              <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium">
                <Home size={18} />
                <span>Home</span>
              </Link>
              <Link href="/contact" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium">
                <Phone size={18} />
                <span>Contact</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{adminUser?.name || 'Admin'}</p>
              <p className="text-xs text-gray-700">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white border-r border-gray-200 text-gray-900 transition-all duration-300 overflow-hidden`}
        >
          <nav className="p-6 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-900"
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
