import type { Metadata } from 'next';
import './globals.css';
import RootLayoutClient from './layout-client';

export const metadata: Metadata = {
  title: 'GST Tax Wale - GST & Income Tax Services',
  description: 'Complete GST filing and income tax services for businesses and individuals',
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
