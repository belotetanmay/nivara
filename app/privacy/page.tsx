'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Eye, ShieldCheck, Lock, Mail, Phone, MapPin } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-16 sm:px-6">
        <div className="space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#E5E1D8] shadow-sm text-primary">
          
          {/* Title Header */}
          <div className="border-b border-[#FAF8F5] pb-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Eye className="w-3.5 h-3.5 text-secondary" /> Privacy Protection Framework
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">Privacy Policy</h1>
            <p className="text-xs text-slate-400">Effective Date: July 2026 • Version 1.0</p>
          </div>

          {/* Alert Notice */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl flex gap-3 items-start border border-slate-800 shadow-md">
            <Lock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white text-xs">DPDP Act Compliant Storage</span>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                In compliance with the Digital Personal Data Protection Act (DPDP Act), 2023, user personal data is processed solely under clear consent and legitimate use guidelines. Encryption safeguards are active for all data in transit and at rest.
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
            
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">1. Overview</h2>
              <p>
                This Privacy Policy explains how <strong>[Nivara legal entity name]</strong> (&quot;Nivara&quot;, &quot;we&quot;, &quot;us&quot;) collects, uses, discloses, retains, and protects personal data in connection with the Nivara website, mobile application, and related on-demand wellness services (collectively, the &quot;Platform&quot;). It is issued in compliance with the Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;), the Information Technology Act, 2000, and the rules made thereunder.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">2. Personal Data We Collect</h2>
              <p>
                We collect personal information necessary to deliver, verify, and improve our mobile relaxation services:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mt-1 text-slate-500">
                <li><span className="font-semibold text-primary">Account Data:</span> Full name, email address, password hashes, mobile number, and registration logs.</li>
                <li><span className="font-semibold text-primary">Wellness Partner verification data (Vendors only):</span> Government-issued identity documents, business registration or licensing details, vehicle identification number (VIN) and registration, proof of insurance, professional wellness certifications, and bank account details for payouts.</li>
                <li><span className="font-semibold text-primary">Booking Data:</span> Wellness service selected, preferred date and time, Session location, session preferences, and booking history.</li>
                <li><span className="font-semibold text-primary">Health and wellness data:</span> Allergies, medical conditions, or stress-relief preferences you voluntarily share to personalize a Session. This is sensitive personal data.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">3. Location Tracking</h2>
              <p>
                <strong>Customers:</strong> We collect precise real-time coordinates only while the app is in use and during active bookings to show nearby available vehicles, calculate pickup distances, and enable live session tracking.
              </p>
              <p>
                <strong>Wellness Partners:</strong> Location is collected in the foreground and background while marked online to enable matching. Partners can go offline to stop tracking.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">4. Data Processing Bases &amp; Sharing</h2>
              <p>
                Nivara does not sell personal data. Information is shared strictly under the following criteria:
                * **Fulfillment:** User names and session addresses are shared with the assigned Wellness Partner to enable pod delivery.
                * **Processors:** Minimum transactional metadata is shared with secure payment gateways, mapping APIs, and email servers bound under processing rules.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">5. Data Retention &amp; Rights</h2>
              <p>
                Personal data is retained only for active account periods, or as necessary to complete transactional audits and legal tax compliance. In accordance with the DPDP Act, you have the right to access summaries of processed data, request corrections, withdraw consent, or trigger account deletion by reaching out to: <strong>support.nivara@gmail.com</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">6. Grievance Officer &amp; Compliance Details</h2>
              <p>
                In compliance with the Digital Personal Data Protection Act, 2023, and the Information Technology Act, 2000, grievances regarding data processing can be submitted to:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="bg-[#FCF9F6] p-4 rounded-xl border border-[#E5E1D8] space-y-1">
                  <span className="font-bold text-primary block">Grievance Officer:</span>
                  <span className="font-medium text-slate-700 block">Mr. Tanmay Belote</span>
                  <span className="text-[10px] text-slate-400 block">Grievance Officer &amp; Head of Partner Relations</span>
                  <span className="text-[10px] text-slate-400 block">Email: support.nivara@gmail.com</span>
                </div>
                <div className="bg-[#FCF9F6] p-4 rounded-xl border border-[#E5E1D8] space-y-1">
                  <span className="font-bold text-primary block">Registered Address:</span>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Nivara<br />
                    [registered address]
                  </p>
                </div>
              </div>
            </section>

          </div>

          <div className="pt-6 border-t border-[#FAF8F5] flex justify-between items-center text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> DPDP Secure Protocol
            </span>
            <span>support.nivara@gmail.com</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
