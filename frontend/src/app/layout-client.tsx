'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import AdminHeader from '../components/AdminHeader';
import SiteFooter from '../components/SiteFooter';
import StickyReferralButton from '../components/StickyReferralButton';
import WhatsAppWidget from '../components/WhatsAppWidget';
import ChatbotWidget from '../components/ChatbotWidget';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Migration: Clear old persistent localStorage sessions
    const keys = ['token', 'user', 'adminToken', 'adminUser', 'userRole'];
    keys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, val);
        }
        localStorage.removeItem(key);
      }
    });
  }, []);

  const isAdmin = pathname?.startsWith('/admin');
  const isDashboard = pathname?.startsWith('/dashboard');
  
  // Show SiteHeader as fallback during hydration
  if (!mounted) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 w-full">{children}</main>
        <SiteFooter />
        <StickyReferralButton />
        <WhatsAppWidget isAdminPanel={false} />
        <ChatbotWidget isAdminPanel={false} />
      </>
    );
  }
  
  return (
    <>
      {!isAdmin && <SiteHeader />}
      <main className="flex-1 w-full">{children}</main>
      {!isAdmin && !isDashboard && <SiteFooter />}
      {!isAdmin && !isDashboard && <StickyReferralButton />}
      <WhatsAppWidget isAdminPanel={isAdmin || false} />
      <ChatbotWidget isAdminPanel={isAdmin || false} />
    </>
  );
}
