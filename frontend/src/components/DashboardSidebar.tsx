'use client';

import Link from 'next/link';
import {
  Home,
  DollarSign,
  Calculator,
  Download,
  ChevronDown,
  Settings,
  User,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardSidebarProps {
  isOpen?: boolean;
  user?: any;
}

export default function DashboardSidebar({ isOpen = true, user }: DashboardSidebarProps) {
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
    },
    {
      label: 'Income Entry',
      icon: DollarSign,
      href: '/dashboard/income',
      submenu: [
        { label: 'Salary', href: '/dashboard/income/salary' },
        { label: 'Business', href: '/dashboard/income/business' },
        { label: 'Capital Gains', href: '/dashboard/income/capital' },
        { label: 'Other Sources', href: '/dashboard/income/other' },
      ],
    },
    {
      label: 'Tax Calculator',
      icon: Calculator,
      href: '/dashboard/calculator',
    },
    {
      label: 'Downloads',
      icon: Download,
      href: '/dashboard/downloads',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      submenu: [
        { label: 'Profile', href: '/dashboard/settings/profile' },
        { label: 'Security', href: '/dashboard/settings/security' },
        { label: 'Preferences', href: '/dashboard/settings/preferences' },
      ],
    },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-64 bg-white text-gray-900 flex flex-col border-r border-gray-200 shadow-sm">
      <div className="p-6 border-b border-blue-200">
        <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm"></div>
          <span className="text-lg font-bold text-blue-600"></span>
        </Link>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Navigation</h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() =>
                      setExpandedMenu(
                        expandedMenu === item.label ? null : item.label
                      )
                    }
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition text-left text-gray-700 hover:text-blue-600"
                  >
                    <item.icon size={20} className="text-blue-600" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transform transition ${
                        expandedMenu === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedMenu === item.label && (
                    <ul className="mt-2 ml-4 space-y-1 border-l border-blue-200">
                      {item.submenu.map((subitem) => (
                        <li key={subitem.label}>
                          <Link
                            href={subitem.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                            {subitem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition text-gray-700 hover:text-blue-600"
                >
                  <item.icon size={20} className="text-blue-600\" />
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-200">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
          <p className="text-xs font-semibold text-blue-600 mb-1">Account</p>
          <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
          <p className="text-xs text-gray-600 truncate">{user?.email}</p>
          {user?.pan && <p className="text-xs text-gray-600">PAN: {user.pan}</p>}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 text-sm font-medium transition rounded-lg border border-red-200">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
