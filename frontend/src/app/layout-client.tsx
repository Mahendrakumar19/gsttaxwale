'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import AdminHeader from '../components/AdminHeader';
import SiteFooter from '../components/SiteFooter';
import StickyReferralButton from '../components/StickyReferralButton';
import WhatsAppWidget from '../components/WhatsAppWidget';
import { Toaster } from 'sonner';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Referral Tracking
    const searchParams = new URLSearchParams(window.location.search);
    const refCode = searchParams.get('ref');
    if (refCode) {
      sessionStorage.setItem('referralCode', refCode);
      console.log('🔗 Referral code tracked:', refCode);
    }
    
    // Synchronization: Ensure sessionStorage has latest auth from localStorage
    const keys = ['token', 'user', 'adminToken', 'adminUser', 'userRole'];
    keys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, val);
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
      </>
    );
  }
  
  return (
    <>
      <Toaster position="top-center" richColors />
      {!isAdmin && <SiteHeader />}
      <main className="flex-1 w-full">{children}</main>
      {!isAdmin && !isDashboard && <SiteFooter />}
      {!isAdmin && !isDashboard && <StickyReferralButton />}
      <WhatsAppWidget isAdminPanel={isAdmin || false} />
    </>
  );
}
