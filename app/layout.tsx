import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GST Tax Wale - Professional Tax Filing Services',
  description: 'Complete GST filing and income tax services for businesses and individuals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 bg-fixed">
        {children}
      </body>
    </html>
  );
}
