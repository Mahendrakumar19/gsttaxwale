'use client';

import React from 'react';
import { Suspense } from 'react';
import SuccessContent from './SuccessContent';

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
