import Link from 'next/link';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-6">
          <AlertTriangle size={64} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-amber-100 mb-8 text-lg">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold rounded-lg transition">
            <Home size={20} />
            Go to Home
          </Link>

          <div>
            <Link href="/services" className="text-amber-400 hover:text-amber-300 font-bold transition">
              Browse Services →
            </Link>
          </div>

          <div>
            <Link href="/contact" className="text-amber-400 hover:text-amber-300 font-bold transition">
              Contact Support →
            </Link>
          </div>
        </div>

        <div className="mt-12 text-amber-200/70 text-sm">
          <p>Error Code: 404 - Not Found</p>
          <p>URL: {typeof window !== 'undefined' ? window.location.pathname : '/'}</p>
        </div>
      </div>
    </div>
  );
}
