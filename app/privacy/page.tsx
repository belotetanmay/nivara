'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Eye, ShieldAlert, Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#E5E1D8] shadow-sm text-primary">
          
          <div className="border-b border-[#FAF8F5] pb-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Eye className="w-3.5 h-3.5" /> Privacy Shield
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">Privacy Policy</h1>
            <p className="text-xs text-slate-400">Last updated: July 2026 • Beta Pilot Edition</p>
          </div>

          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl flex gap-3 items-start border border-slate-800 shadow-md">
            <Lock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white text-xs">KYC & Data Encrypted Storage</span>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                All submitted identity cards and user details are securely encrypted and stored within our private Supabase database. Only vetted administrators can access documents for approval. No raw files are visible to partners, vendors, or external third parties.
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
            
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">1. Information We Collect</h2>
              <p>
                To provide you with secure access to our luxury wellness pods, we collect the following data during the pilot phase:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-500">
                <li><span className="font-semibold text-primary">Personal Details:</span> Name, email address, and phone number when registering.</li>
                <li><span className="font-semibold text-primary">KYC Verification Files:</span> Scanned images of ID cards or licenses to satisfy secure cabin entry criteria.</li>
                <li><span className="font-semibold text-primary">Sensory Presets:</span> Scent, ambient color lighting, and binaural audio options chosen for cabin configurations.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">2. Location Data Policy</h2>
              <div className="p-3.5 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg flex gap-2 items-start">
                <ShieldAlert className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-[10px] leading-relaxed">
                  <span className="font-bold block">No Real-time Live Tracking</span>
                  We do not track your real-time smartphone background location. We only record static coordinates: (1) pickup and dropoff addresses for Pick & Drop bookings, and (2) coordinates of active regional vans to display them on the search map.
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">3. How We Use Your Data</h2>
              <p>
                Your data is exclusively processed to manage slots bookings, authenticate entry door QR locks, process simulated checkout totals, and customize your cabin acoustics and aroma preferences. We do not sell or monetize personal information.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">4. Data Access & Sharing</h2>
              <p>
                Only authenticated administrators can view your KYC verification logs to approve account activations. Attendants and vendors only see booking codes, first names, slot schedules, and sensory presets (aroma/light/audio) to configure cabins. Revenue earnings are strictly protected under row-level security (RLS) and are never visible to other partners.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">5. Cookies & Local Cache</h2>
              <p>
                We use cookies to preserve your authenticated user sessions (`auth_token`) and local browser storage to cache your sensory customizer presets and AI chatbot conversations, ensuring smooth navigation without session loss.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-primary">6. Deletion Requests</h2>
              <p>
                You may request account deletion at any time by emailing our support desk. Upon approval, all uploaded identity documents, bookings logs, and credentials will be permanently purged from our databases.
              </p>
            </section>

          </div>

          <div className="pt-6 border-t border-[#FAF8F5] flex justify-between items-center text-[10px] text-slate-400">
            <span>support.nivara@gmail.com</span>
            <span>Nivara Privacy Committee</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
