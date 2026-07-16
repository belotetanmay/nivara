'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Scale, AlertOctagon, HelpCircle } from 'lucide-react';

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
            <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">Terms &amp; Conditions</h1>
            <p className="text-xs text-slate-400">Last updated: July 2026 • Version 1.0</p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
            <AlertOctagon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 text-xs">Official Platform Notice</span>
              <p className="text-[10px] text-amber-700 leading-relaxed mt-0.5">
                Nivara is operated by Nivara Wellness Private Limited. By registering on our website or booking wellness sessions, you agree to be bound by these Terms and the Cancellation and Refund Policy incorporated herein.
              </p>
            </div>
          </div>

          <div className="space-y-8 text-xs text-slate-600 leading-relaxed">
            
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">1. Nature of Platform &amp; Services</h2>
              <p>
                Nivara operates a technology-based, on-demand marketplace connecting users with independent Wellness Partners (Vendors) operating climate-controlled Nivara Stress Relief Vans. 
                Nivara does not own or operate the vehicles directly, nor does it employ the wellness staff. The cleanliness, condition, and provision of the relaxation sessions remain the sole responsibility of the Wellness Partner.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">2. Booking Tiers &amp; Service Models</h2>
              <p>
                Sessions are bookable in three tiers: **30-minute**, **45-minute**, or **60-minute** durations. Nivara offers two fulfillment models:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-1 text-slate-500">
                <li>
                  <span className="font-semibold text-primary">Steady Position:</span> The pod vehicle remains stationary at designated corporate hubs or residential societies, and users walk in at their reserved times.
                </li>
                <li>
                  <span className="font-semibold text-primary">Pick &amp; Drop:</span> The pod vehicle travels to the user&apos;s specified pickup address, hosts the relaxation session, and returns them to their drop-off point. Pickup and drop-off points must reside within the vehicle&apos;s active service radius.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">3. Cancellation &amp; Refund Policy</h2>
              <p>
                Our cancellation policy is designed to respect the schedules of both our customers and our Wellness Partners. Cancellations must be submitted through the customer dashboard:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="bg-[#FCF9F6] p-3 rounded-lg border border-[#E5E1D8]/60">
                  <span className="font-bold text-primary block">Free Cancellation</span>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Cancel or reschedule at least **60 minutes** before your scheduled session starts (or before the van is dispatched) for a **100% full refund** credited back to your original payment mode.
                  </p>
                </div>
                <div className="bg-red-50/40 p-3 rounded-lg border border-red-100">
                  <span className="font-bold text-red-800 block">Late Cancellation &amp; No-Show</span>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Cancellations made within **60 minutes** of start time are charged a **50% cancellation fee**. No-shows (not present within 15 minutes of van arrival) are charged up to **100% of the session value**.
                  </p>
                </div>
              </div>
              <p className="mt-2 text-slate-500">
                Approved refunds are processed within 48 hours and credited back to the original mode of payment within 5–7 business days.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">4. Health, Safety &amp; Medical Disclaimers</h2>
              <p>
                Nivara Vans are equipped with reclining massage chairs, aromatherapy, and spatial audio designed for general relaxation and stress relief.
              </p>
              <p className="font-semibold text-primary">
                NIVARA IS NOT A MEDICAL OR PSYCHIATRIC SERVICE PROVIDER. SESSIONS ARE NOT A SUBSTITUTE FOR CLINICAL TREATMENT.
              </p>
              <p>
                Users with claustrophobia, cardiovascular or spinal conditions, photosensitivity, mobility limitations, pregnancy, or fragrance allergies are strongly advised to consult a healthcare professional before booking sessions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">5. Mandatory Cleaning Buffers &amp; Overtime Fees</h2>
              <p>
                To maintain our hygiene standards, a mandatory **15-minute cleaning buffer** is enforced between consecutive bookings on every van. 
                Users must exit the vehicle immediately upon session completion. If actual duration exceeds the reserved slot time, overtime fees will be charged pro-rata:
              </p>
              <p className="bg-[#FCF9F6] p-3 rounded border border-[#E5E1D8]/60 text-[#2C5234] font-medium mt-1 font-mono">
                Overtime Fee = (Price of 30-Minute Base Slot / 30) &times; Overtime Minutes.
              </p>
              <p>
                Unpaid overtime balances must be settled from the dashboard before booking future sessions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">6. Grievance Redressal</h2>
              <p>
                Under the Consumer Protection Act and IT Intermediary Rules, user grievances should be directed to our Grievance Officer:
              </p>
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E5E1D8]/60 space-y-1">
                <div><span className="font-bold text-primary">Grievance Officer:</span> Rahul Mehta, Legal Lead</div>
                <div><span className="font-bold text-primary">Email:</span> grievance@nivara.in</div>
                <div><span className="font-bold text-primary">Address:</span> Nivara Wellness Private Limited, Bandra West, Mumbai, MH - 400050</div>
              </div>
            </section>

          </div>

          <div className="pt-6 border-t border-[#FAF8F5] flex justify-between items-center text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> Publication Certified Version 1.0
            </span>
            <span>support@nivara.in</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
