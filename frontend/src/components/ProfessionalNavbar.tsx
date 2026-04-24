'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Menu, X, LogOut, ChevronDown } from 'lucide-react';

export default function ProfessionalNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    return null;
  }

  const menuItems = [
    {
      label: 'Expert Consultation',
      icon: '👨‍⚖️',
      submenu: [
        { label: 'Talk to a Lawyer', href: '/contact' },
        { label: 'CA Consultation', href: '/services' },
        { label: 'Tax Advisor', href: '/services' },
      ]
    },
    {
      label: 'Business Services',
      icon: '🏢',
      submenu: [
        { label: 'Company Registration', href: '/services' },
        { label: 'GST Registration', href: '/services' },
        { label: 'Business Licenses', href: '/services' },
      ]
    },
    {
      label: 'Tax & Compliance',
      icon: '📋',
      submenu: [
        { label: 'Income Tax Filing', href: '/services' },
        { label: 'Annual Compliance', href: '/services' },
        { label: 'TDS Return Filing', href: '/services' },
      ]
    },
    {
      label: 'Intellectual Property',
      icon: '🏆',
      submenu: [
        { label: 'Trademark Registration', href: '/services' },
        { label: 'Patent Registration', href: '/services' },
        { label: 'Copyright Registration', href: '/services' },
      ]
    },
    {
      label: 'Documentation',
      icon: '📄',
      submenu: [
        { label: 'Legal Documents', href: '/services' },
        { label: 'Contracts', href: '/services' },
        { label: 'Agreements', href: '/services' },
      ]
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition">
            <span className="text-blue-600">GST</span>
            <span className="text-gray-800">Tax Wale</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1 transition">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  <ChevronDown size={16} className="group-hover:rotate-180 transition" />
                </button>

                {/* Mega Dropdown Menu */}
                <div className="absolute left-0 pt-0 hidden group-hover:block w-max">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-6 mt-0">
                    <div className="grid grid-cols-1 gap-4">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition flex items-center gap-2"
                        >
                          <span>→</span>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-600 hover:text-blue-600 transition"
              >
                <Search size={20} />
              </button>
              {searchOpen && (
                <input
                  type="text"
                  placeholder="Search services..."
                  className="absolute right-0 -top-1 w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              )}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated && user ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium rounded transition">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 font-medium rounded transition flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-gray-600 hover:text-blue-600 transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-200 mt-2">
            <div className="flex flex-col gap-2 pt-4">
              {menuItems.map((item) => (
                <div key={item.label}>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transition ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {activeDropdown === item.label && (
                    <div className="bg-gray-50 ml-4">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="block px-4 py-2 text-gray-700 hover:text-blue-600 text-sm"
                          onClick={() => setIsOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="border-t border-gray-200 pt-3 mt-2">
                {isAuthenticated && user ? (
                  <>
                    <Link href="/dashboard" className="block px-4 py-2 text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 font-medium flex items-center gap-2 mt-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="block px-4 py-2 text-gray-700 font-medium" onClick={() => setIsOpen(false)}>
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
