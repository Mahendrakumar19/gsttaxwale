'use client';

import { Suspense } from 'react';
import ResetPasswordForm from './form';

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
