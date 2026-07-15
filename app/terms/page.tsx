'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Scale, AlertOctagon } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#E5E1D8] shadow-sm text-primary">
          
          <div className="border-b border-[#FAF8F5] pb-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Scale className="w-3.5 h-3.5" /> Legal Framework
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">Terms of Service</h1>
            <p className="text-xs text-slate-400">Last updated: July 2026 • Beta Pilot Edition</p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
            <AlertOctagon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 text-xs">Beta Pilot Phase Notice</span>
              <p className="text-[10px] text-amber-700 leading-relaxed mt-0.5">
                Nivara is currently operating in beta pilot mode across Mumbai and Thane West regions. Payment services, coordinates logging, and scheduling functions are simulated. No real money transactions or live tracking are active at this stage.
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
            
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">1. Agreement to Terms</h2>
              <p>
                By accessing or using the Nivara wellness van discovery platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the services.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">2. Pilot Scope & Eligibility</h2>
              <p>
                Services are restricted to pilot areas in Mumbai and Thane West. Users must complete identity verification (KYC check-ins) and be verified by our administrative staff before booking relaxation slots. Only one account per individual is allowed.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">3. Service Models</h2>
              <p>
                Nivara offers two service models for our wellness pods:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-500">
                <li><span className="font-semibold text-primary">Steady Position:</span> The cabin remains stationary at designated anchor points. The user walks in at the scheduled time.</li>
                <li><span className="font-semibold text-primary">Pick & Drop:</span> The cabin is driven to the user's pick-up address for the relaxation session and returns them to their drop-off address. Pickup and dropoff points must reside within the vehicle's active service radius.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">4. Booking Sessions & Overtime Charges</h2>
              <p>
                Sessions are booked in 30, 45, or 60-minute slots. Actual duration inside the cabin is recorded by partner attendants. If actual time spent exceeds the reserved slot length, overtime charges apply:
              </p>
              <p className="bg-[#FCF9F6] p-3 rounded border border-[#E5E1D8]/60 text-[#2C5234] font-medium mt-1">
                Overtime Fee = (Price of 30-Minute Base Slot / 30) × Overtime Minutes.
              </p>
              <p>
                Pending overtime fees must be paid through the customer dashboard before booking future sessions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">5. Parking Fees</h2>
              <p>
                Dedicated parking spots at prime office hubs or residential clusters are charged a flat ₹150 parking fee, which is added to the checkout fare.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">6. Simulated Payment Policy</h2>
              <p>
                All transactions completed during this pilot phase are simulations. Credit card details entered on checkout pages are dummy fields; do not enter real credit card numbers. No actual billing charges will be processed.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">7. Termination & Liability</h2>
              <p>
                Nivara reserves the right to suspend accounts failing KYC checks or violating pilot guidelines. Nivara is not liable for service interruptions or coordinate errors during this test pilot phase.
              </p>
            </section>

          </div>

          <div className="pt-6 border-t border-[#FAF8F5] flex justify-between items-center text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> Secure Beta Protocol
            </span>
            <span>support.nivara@gmail.com</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
