'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, Users, Award, Heart } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-16 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
            <Sparkles className="w-3.5 h-3.5" /> Our Sanctuary
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-primary leading-tight">
            Escape the Chaos, <br className="hidden sm:block"/> Find Your Calm
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Nivara was built as a response to the active, over-stimulated city life. We design next-generation sensory wellness pods stationed strategically across Mumbai and Thane to give urban professionals their peace back.
          </p>
        </div>

        {/* Co-Founders Grid */}
        <div className="space-y-8">
          <div className="border-b border-[#E5E1D8] pb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            <h2 className="font-serif text-2xl font-bold text-primary">Co-Founders</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Co-Founder 1: Tanmay Belote */}
            <div className="bg-white border border-[#E5E1D8] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center font-serif text-lg font-bold text-primary">
                  TB
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">Mr. Tanmay Belote</h3>
                  <p className="text-xs text-secondary font-semibold mt-0.5">Co-Founder, Frontend & Backend Design</p>
                </div>
              </div>
              <blockquote className="text-xs text-slate-500 italic leading-relaxed border-l-2 border-secondary/30 pl-3">
                &quot;If it’s about spreading happiness and restoring peace to modern life, why not give it a try? Join Nivara and claim your sanctuary.&quot;
              </blockquote>
            </div>

            {/* Co-Founder 2: Diya Patil */}
            <div className="bg-white border border-[#E5E1D8] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center font-serif text-lg font-bold text-secondary">
                  DP
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">Ms. Diya Patil</h3>
                  <p className="text-xs text-secondary font-semibold mt-0.5">Co-Founder, UI/UX Design</p>
                </div>
              </div>
              <blockquote className="text-xs text-slate-500 italic leading-relaxed border-l-2 border-secondary/30 pl-3">
                &quot;Urban chaos is actively draining everyone's sanity, so we built Nivara to unapologetically steal your peace back.&quot;
              </blockquote>
            </div>

            {/* Co-Founder 3: Athashree Patil */}
            <div className="bg-white border border-[#E5E1D8] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center font-serif text-lg font-bold text-primary">
                  AP
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">Ms. Athashree Patil</h3>
                  <p className="text-xs text-secondary font-semibold mt-0.5">Co-Founder, UI/UX Design</p>
                </div>
              </div>
              <blockquote className="text-xs text-slate-500 italic leading-relaxed border-l-2 border-secondary/30 pl-3">
                &quot;Every meaningful innovation begins with a simple belief: people deserve better.&quot;
              </blockquote>
            </div>
          </div>
        </div>

        {/* Development Crew Grid */}
        <div className="space-y-8">
          <div className="border-b border-[#E5E1D8] pb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-secondary" />
            <h2 className="font-serif text-2xl font-bold text-primary">Core Crew & Engineering</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Crew 1: Karan Siddhi */}
            <div className="bg-white border border-[#E5E1D8] p-5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-start gap-4 text-primary">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center font-serif font-black text-slate-700 flex-shrink-0">
                KS
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold">Mr. Karan Siddhi</h4>
                <p className="text-[10px] text-secondary font-semibold">Vendor & Admin Modules Lead</p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Architected the partner dashboard workflows, slots allocation schedules, and KYC vetting pipelines.
                </p>
              </div>
            </div>

            {/* Crew 2: Harsh Thakur */}
            <div className="bg-white border border-[#E5E1D8] p-5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-start gap-4 text-primary">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center font-serif font-black text-slate-700 flex-shrink-0">
                HT
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold">Mr. Harsh Thakur</h4>
                <p className="text-[10px] text-secondary font-semibold">Backend Developer</p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Built API routers, Prisma relational mappings, geocoding engines, and overtime billing services.
                </p>
              </div>
            </div>

            {/* Crew 3: Shubham Gawand */}
            <div className="bg-white border border-[#E5E1D8] p-5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-start gap-4 text-primary">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center font-serif font-black text-slate-700 flex-shrink-0">
                SG
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold">Mr. Shubham Gawand</h4>
                <p className="text-[10px] text-secondary font-semibold">Marketing & Documentation</p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Heads legal policy frameworks, brand assets design, pilot outreach programs, and customer relations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Philosophy */}
        <div className="bg-slate-900 text-slate-200 p-8 sm:p-12 rounded-3xl relative overflow-hidden shadow-lg flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="absolute inset-0 bg-[radial-gradient(#C19A6B_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
          <div className="relative z-10 space-y-4 max-w-lg text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-primary-foreground">
              <Heart className="w-3.5 h-3.5" /> Our Mission
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
              Reclaiming quiet spaces in noisy urban hubs.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modern life is chaotic. Between endless commutes and noisy offices, cognitive fatigue is a real problem. Nivara provides local, soundproofed cabins equipped with zero-gravity recliners and aromatherapy to help you reboot.
            </p>
          </div>
          <div className="relative z-10 bg-white/5 border border-white/10 p-6 rounded-2xl max-w-xs space-y-2.5 text-center flex-shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pilot Achievements</span>
            <span className="text-4xl font-serif font-black text-secondary block">Mumbai</span>
            <p className="text-[10px] text-slate-400 leading-normal">
              Proudly launched and expanding our initial sensory van operations in Mumbai and Thane West pilot zones.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
