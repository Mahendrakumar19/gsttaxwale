'use client';

import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hide site header and footer for dashboard pages
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const main = document.querySelector('main');
    
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    // Adjust main to take full height
    if (main) {
      main.style.minHeight = '100vh';
      main.style.padding = '0';
    }
    
    return () => {
      if (header) header.style.display = 'block';
      if (footer) footer.style.display = 'block';
      if (main) {
        main.style.minHeight = 'auto';
        main.style.padding = '';
      }
    };
  }, []);

  return children;
}
