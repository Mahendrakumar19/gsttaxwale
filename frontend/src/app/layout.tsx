import type { Metadata, Viewport } from 'next';
import './globals.css';
import RootLayoutClient from './layout-client';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: 'GST Tax Wale - GST & Income Tax Services',
  description: 'Complete GST filing and income tax services for businesses and individuals',
  metadataBase: new URL('https://gsttaxwale.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GST Tax Wale - GST & Income Tax Services',
    description: 'Complete GST filing and income tax services for businesses and individuals',
    url: 'https://gsttaxwale.com',
    siteName: 'GST Tax Wale',
    images: [
      {
        url: '/gsttaxwale_logo.svg',
        width: 800,
        height: 600,
        alt: 'GST Tax Wale Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GST Tax Wale - GST & Income Tax Services',
    description: 'Complete GST filing and income tax services for businesses and individuals',
    images: ['/gsttaxwale_logo.svg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-white text-gray-900 transition-colors duration-300">
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
