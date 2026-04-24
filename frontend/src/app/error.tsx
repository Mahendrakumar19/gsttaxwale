'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Oops!</h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-8">
          An unexpected error occurred. Our team has been notified.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-red-700 text-xs font-mono break-words">{error.message}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
          >
            Try Again
          </button>

          <a
            href="/"
            className="block px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition"
          >
            Go to Home
          </a>

          <a
            href="/contact"
            className="text-blue-600 hover:text-blue-700 font-bold transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
