import type { Metadata } from 'next';
import './globals.css';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import WhatsAppWidget from '../components/WhatsAppWidget';
import ChatbotWidget from '../components/ChatbotWidget';

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
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppWidget />
        <ChatbotWidget />
      </body>
    </html>
  );
}
