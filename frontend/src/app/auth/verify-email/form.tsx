'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, CheckCircle } from 'lucide-react';

function VerificationInput({ onSubmit, loading }: { onSubmit: (code: string) => void; loading: boolean }) {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }

    if (newCode.every(c => c)) {
      onSubmit(newCode.join(''));
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {code.map((_, idx) => (
        <input
          key={idx}
          id={`code-${idx}`}
          type="text"
          maxLength={1}
          value={code[idx]}
          onChange={(e) => handleChange(idx, e.target.value)}
          disabled={loading}
          className="w-12 h-12 bg-white border border-gray-300 rounded-lg text-gray-900 text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      ))}
    </div>
  );
}

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerifyCode = async (code: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (res.ok) {
        setVerified(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setError('');
        alert('Verification code resent to your email');
      } else {
        setError('Failed to resend code');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-8">
          <div className="text-center mb-8">
            {verified ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verified!</h1>
                <p className="text-gray-700">Your account is ready. Redirecting to login...</p>
              </>
            ) : (
              <>
                <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                <p className="text-gray-700">We've sent a verification code to:</p>
                <p className="text-blue-600 font-semibold mt-2">{email}</p>
              </>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {!verified && (
            <div className="space-y-4">
              <p className="text-gray-700 text-sm text-center">
                Enter the 6-digit code sent to your email
              </p>

              <VerificationInput onSubmit={handleVerifyCode} loading={loading} />

              <div className="flex gap-2">
                <button
                  onClick={handleResendCode}
                  disabled={resendLoading}
                  className="flex-1 py-2 text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg transition text-sm font-bold disabled:opacity-50"
                >
                  {resendLoading ? 'Resending...' : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-700 text-sm">
              Already verified? <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-bold">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
