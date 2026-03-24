"use client";
import React, { Suspense } from 'react';
import CheckoutContent from './CheckoutContent';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
