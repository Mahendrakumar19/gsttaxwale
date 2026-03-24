'use client';

import Link from 'next/link';
import {
  Home,
  Gift,
  DollarSign,
  Calculator,
  Download,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

interface DashboardSidebarProps {
  isOpen?: boolean;
}

export default function DashboardSidebar({ isOpen = true }: DashboardSidebarProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>('filings');

  const menuItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
    },
    {
      label: 'Referral Bonus Program',
      icon: Gift,
      href: '/referral',
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
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col border-r border-amber-500/30">
      <div className="p-6 border-b border-amber-500/20">
        <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text">Menu</h2>
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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-amber-900/30 transition text-left text-amber-100 hover:text-amber-300"
                  >
                    <item.icon size={20} className="text-amber-400" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transform transition ${
                        expandedMenu === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedMenu === item.label && (
                    <ul className="mt-2 ml-4 space-y-1 border-l border-amber-500/30">
                      {item.submenu.map((subitem) => (
                        <li key={subitem.label}>
                          <Link
                            href={subitem.href}
                            className="block px-4 py-2 text-sm text-amber-200/70 hover:text-amber-300 hover:bg-amber-900/20 rounded transition"
                          >
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
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-amber-900/30 transition text-amber-100 hover:text-amber-300"
                >
                  <item.icon size={20} className="text-amber-400" />
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-amber-500/20 text-sm text-amber-200/70">
        <p>© 2024 GST Tax Wale</p>
      </div>
    </aside>
  );
}
