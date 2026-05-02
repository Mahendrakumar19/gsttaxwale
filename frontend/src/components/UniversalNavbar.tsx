'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Menu, X, LogOut } from 'lucide-react';

export default function UniversalNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if we're on dashboard (use different styling)
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    setIsAuthenticated(!!token);
    if (userData && userData !== 'undefined') {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Invalid user data:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/auth/login');
  };

  if (isDashboard) {
    // Dashboard navbar is handled by DashboardHeader
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-amber-500/30 sticky top-0 z-50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <img src="/gsttaxwale_logo.svg" alt="GST Tax Wale" className="h-8 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/services" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Services
            </Link>
            <Link href="/#about" className="text-gray-700 hover:text-blue-600 transition font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition font-medium">
              Contact
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition font-medium">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition font-medium flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-blue-600 hover:text-blue-700 transition font-medium">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-blue-600 hover:text-blue-700 transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-amber-500/20 mt-2">
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/services" className="text-gray-700 hover:text-blue-600 transition font-medium px-4 py-2" onClick={() => setIsOpen(false)}>
                Services
              </Link>
              <Link href="/#about" className="text-gray-700 hover:text-blue-600 transition font-medium px-4 py-2" onClick={() => setIsOpen(false)}>
                About
              </Link>
              <Link href="/#pricing" className="text-gray-700 hover:text-blue-600 transition font-medium px-4 py-2" onClick={() => setIsOpen(false)}>
                Pricing
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition font-medium px-4 py-2" onClick={() => setIsOpen(false)}>
                Contact
              </Link>
              <div className="border-t border-amber-500/20 pt-3 mt-2">
                {isAuthenticated && user ? (
                  <>
                    <Link href="/dashboard" className="block px-4 py-2 text-blue-600 hover:text-blue-700 font-medium" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 font-medium flex items-center gap-2 mt-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="block px-4 py-2 text-blue-600 hover:text-blue-700 font-medium" onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
