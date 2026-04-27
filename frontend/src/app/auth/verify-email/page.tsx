'use client';

import { Suspense } from 'react';
import VerifyEmailForm from './form';

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
