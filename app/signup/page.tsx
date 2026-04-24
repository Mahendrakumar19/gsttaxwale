'use client';

import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Registration</h1>
          <p className="text-slate-600">
            New user accounts are created by our admin team only.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-800 font-medium mb-1">How to get access:</p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Contact our team via phone or email</li>
            <li>Your credentials will be sent via WhatsApp/email</li>
            <li>Login with the details provided by admin</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/contact"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Contact Us
          </Link>
          <Link href="/login" className="block text-sm text-slate-600 hover:text-blue-600">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
