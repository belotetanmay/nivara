'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CreditCard, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get('booking_id') || '';
  const amount = searchParams.get('amount') || '0';
  const sessionId = searchParams.get('session_id') || '';

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('***');
  const [name, setName] = useState('Test Traveler');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          sessionId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push(`/customer/bookings/${bookingId}/confirmation`);
      } else {
        setError(data.error || 'Failed to process sandbox payment.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An error occurred processing test payment.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel payment selection? This slot will be released.')) return;
    try {
      await fetch(`/api/customer/bookings/${bookingId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error(e);
    }
    router.push('/customer/search');
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="flex gap-2.5 items-start p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs animate-pulse">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
        <div>
          <span className="font-bold block">Beta Pilot Mode - Simulated Checkout</span>
          No real card payments are collected yet. Stripe gateways and live vehicle coordinates tracking are disabled for this phase. Please click &quot;Complete Payment&quot; below to simulate validation.
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
          {error}
        </div>
      )}

      {/* Credit Card Inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5E1D8] rounded text-xs bg-[#FCF9F6]/20 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Card Number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              required
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-[#E5E1D8] rounded text-xs bg-[#FCF9F6]/20 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              required
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              className="w-full px-3 py-2 border border-[#E5E1D8] rounded text-xs bg-[#FCF9F6]/20 focus:outline-none text-center"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              CVV / CVC
            </label>
            <input
              type="password"
              required
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="•••"
              className="w-full px-3 py-2 border border-[#E5E1D8] rounded text-xs bg-[#FCF9F6]/20 focus:outline-none text-center"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-[#FAF8F5] flex justify-between items-center text-xs font-bold text-primary">
        <span>Order Amount</span>
        <span className="text-base text-secondary">₹{amount}</span>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all disabled:opacity-55 flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? 'Verifying payment...' : 'Complete Payment'}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-red-500 py-1 transition-colors"
        >
          Cancel & Return
        </button>
      </div>
    </form>
  );
}

export default function PaymentsCheckout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-md mx-auto w-full px-4 py-16 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-[#E5E1D8] shadow-md w-full space-y-6">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold text-primary">Nivara Payments Gateway</h1>
            <p className="text-[10px] text-muted-foreground mt-1">Vetted Partner Secure Checkout Sandbox</p>
          </div>

          <Suspense fallback={<div className="flex justify-center"><span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span></div>}>
            <PaymentForm />
          </Suspense>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted Verification Protocol</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
