"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Fetch user role from /api/auth/me
      (async () => {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data?.data?.user?.role === 'admin') {
            setIsAdmin(true);
          }
        } catch (err) {
          console.error('Failed to fetch user role', err);
        }
      })();
    }
  }, []);

  if (!mounted) {
    return (
      <header className="glassmorphic sticky top-0 z-50 border-b border-slate-600">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center font-bold text-white">₹</div>
              <span className="text-2xl font-bold gradient-text hidden sm:block">GST Tax Wale</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="glassmorphic sticky top-0 z-50 border-b border-slate-600">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center font-bold text-white">₹</div>
            <span className="text-2xl font-bold gradient-text hidden sm:block">GST Tax Wale</span>
          </Link>
          <nav className="hidden lg:flex space-x-6 text-sm font-medium">
            <Link href="/services" className="text-slate-300 hover:text-amber-400 transition">Services</Link>
            <Link href="/pricing" className="text-slate-300 hover:text-amber-400 transition">Pricing</Link>
            <Link href="/investments" className="text-slate-300 hover:text-amber-400 transition">Investments</Link>
            <Link href="/corporate" className="text-slate-300 hover:text-amber-400 transition">Corporate</Link>
            <Link href="/contact" className="text-slate-300 hover:text-amber-400 transition">Contact</Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <Link href="/dashboard" className="text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition font-medium">
                Dashboard
              </Link>
              {isAdmin && (
                <Link href="/admin/dashboard" className="text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-purple-500 text-white px-3 py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition font-medium">
                  Admin Panel
                </Link>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition font-medium">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
