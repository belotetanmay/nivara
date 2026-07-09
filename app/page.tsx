'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Compass, ShieldCheck, Clock, Zap, MapPin, CheckCircle, Sparkles, 
  Coffee, ArrowRight, CheckCircle2, Armchair, Wind, Headphones, Sun, 
  Music, Sparkle, Eye, Moon, Activity, Volume2, UserCheck, CreditCard, TrendingUp 
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Customizer state
  const [calmTab, setCalmTab] = useState<'aroma' | 'light' | 'audio'>('aroma');
  const [selectedAroma, setSelectedAroma] = useState('Lavender');
  const [selectedLight, setSelectedLight] = useState('Sunset Copper');
  const [selectedAudio, setSelectedAudio] = useState('Binaural Beats');

  // Time of day state
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Interactive FAQ state
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });
      if (res.ok) {
        setContactStatus('success');
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      } else {
        setContactStatus('error');
      }
    } catch {
      setContactStatus('error');
    }
  };

  // Dynamic pricing matrix calculation
  const getSessionPrice = (duration: 30 | 45 | 60) => {
    let base = 0;
    if (duration === 30) base = 299;
    else if (duration === 45) base = 449;
    else if (duration === 60) base = 599;

    // Price multipliers based on time of day
    if (timeOfDay === 'morning') return base - 50; // Discounted
    if (timeOfDay === 'afternoon') return base;    // Standard
    if (timeOfDay === 'evening') return base + 50;  // Peak demand
    if (timeOfDay === 'night') return base + 100;   // Late night recovery premium
  };

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      <Navbar />

      <main className="flex-grow">
        
        {/* 1. IoT Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 px-4 py-20 text-center animate-in fade-in-0 duration-500">
          {/* Ambient background video loop */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          >
            <source src="/video.mp4" type="video/mp4" />
          </video>
          
          {/* Very subtle dark gradient overlay behind the yellow text for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/55 z-0"></div>
          
          {/* Centering container to let video flow behind text elements */}
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 px-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/50 text-yellow-400 border border-yellow-400/35 backdrop-blur-sm shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> IoT-Enabled On-Demand Wellness
            </span>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-yellow-400 leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
              IoT-Enabled <span className="text-yellow-300">On-Demand Wellness Vans</span>
            </h1>
            
            <p className="text-yellow-100/90 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-sans font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              Smart mobile recovery suites delivering climate-controlled, synchronized bio-hacking therapies directly to your doorstep via real-time cloud automation.
            </p>
            
            <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                href="/customer/search"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-xs font-bold text-slate-950 bg-gradient-to-r from-yellow-400 to-yellow-300 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/35 transition-all gap-2 btn-premium"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Social proof metric chips inside the card */}
            <div className="flex flex-wrap justify-center items-center gap-4 pt-4 opacity-90 text-yellow-100/90 text-[10px] font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 bg-slate-950/70 px-4 py-2 rounded-full border border-yellow-400/20 backdrop-blur-sm shadow-md">
                <span className="flex h-2 w-2 rounded-full bg-secondary animate-ping"></span>
                <span>0 sessions booked</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/70 px-4 py-2 rounded-full border border-yellow-400/20 backdrop-blur-sm shadow-md">
                <div className="flex text-amber-400">★★★★★</div>
                <span>Avg. rating: —</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/70 px-4 py-2 rounded-full border border-yellow-400/20 backdrop-blur-sm shadow-md">
                <Compass className="w-3 h-3 text-primary animate-spin-slow" />
                <span>1 vans initializing for launch</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Choose Your Calm Widget */}
        <section className="py-24 bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Choose Your <span className="text-gradient">Calm</span>
              </h2>
              <p className="text-[#64748B] text-sm max-w-xl mx-auto">
                Preview your session customization in real-time. Every sense is yours to orchestrate — scent, light, and sound, tuned to your exact preference.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
              
              {/* Tab Selector & Choice list */}
              <div className="lg:col-span-7 bg-[#F8FAFC] rounded-3xl p-6 sm:p-8 border border-border flex flex-col justify-between space-y-6">
                
                {/* Horizontal Category Switcher */}
                <div className="flex border-b border-slate-200 p-1 bg-white rounded-full shadow-sm">
                  <button
                    onClick={() => setCalmTab('aroma')}
                    className={`flex-grow flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-full transition-all ${
                      calmTab === 'aroma'
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    <Wind className="w-3.5 h-3.5" /> Aromatherapy
                  </button>
                  <button
                    onClick={() => setCalmTab('light')}
                    className={`flex-grow flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-full transition-all ${
                      calmTab === 'light'
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" /> Lighting
                  </button>
                  <button
                    onClick={() => setCalmTab('audio')}
                    className={`flex-grow flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-full transition-all ${
                      calmTab === 'audio'
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Audio
                  </button>
                </div>

                {/* Option Selector Cards Grid */}
                <div className="space-y-3 flex-grow pt-4">
                  {calmTab === 'aroma' && [
                    { name: 'Lavender', desc: 'Deep relaxation & sleep prep', color: 'text-purple-500' },
                    { name: 'Eucalyptus', desc: 'Mental clarity & respiratory ease', color: 'text-emerald-500' },
                    { name: 'Citrus', desc: 'Energizing mood elevation', color: 'text-amber-500' }
                  ].map((x) => (
                    <button
                      key={x.name}
                      onClick={() => setSelectedAroma(x.name)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        selectedAroma === x.name
                          ? 'bg-white border-primary shadow-sm ring-1 ring-primary/20'
                          : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center ${x.color}`}>
                          <Wind className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">{x.name}</p>
                          <p className="text-[10px] text-[#64748B]">{x.desc}</p>
                        </div>
                      </div>
                      {selectedAroma === x.name && (
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <CheckCircle2 className="w-4 h-4 fill-current" />
                        </div>
                      )}
                    </button>
                  ))}

                  {calmTab === 'light' && [
                    { name: 'Sunset Copper', desc: 'Warm amber glow & red tones', color: 'text-amber-500' },
                    { name: 'Forest Aurora', desc: 'Calming green and teal', color: 'text-teal-500' },
                    { name: 'Midnight Indigo', desc: 'Soothing deep indigo sleep lighting', color: 'text-indigo-500' }
                  ].map((x) => (
                    <button
                      key={x.name}
                      onClick={() => setSelectedLight(x.name)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        selectedLight === x.name
                          ? 'bg-white border-primary shadow-sm ring-1 ring-primary/20'
                          : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center ${x.color}`}>
                          <Sun className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">{x.name}</p>
                          <p className="text-[10px] text-[#64748B]">{x.desc}</p>
                        </div>
                      </div>
                      {selectedLight === x.name && (
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <CheckCircle2 className="w-4 h-4 fill-current" />
                        </div>
                      )}
                    </button>
                  ))}

                  {calmTab === 'audio' && [
                    { name: 'Binaural Beats', desc: 'Theta frequency brainwave sync', color: 'text-blue-500' },
                    { name: 'Rainforest Solfeggio', desc: 'Nature sounds & high fidelity streams', color: 'text-emerald-500' },
                    { name: 'Cosmic Resonance', desc: 'Ethereal ambient space pads', color: 'text-purple-500' }
                  ].map((x) => (
                    <button
                      key={x.name}
                      onClick={() => setSelectedAudio(x.name)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        selectedAudio === x.name
                          ? 'bg-white border-primary shadow-sm ring-1 ring-primary/20'
                          : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center ${x.color}`}>
                          <Headphones className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">{x.name}</p>
                          <p className="text-[10px] text-[#64748B]">{x.desc}</p>
                        </div>
                      </div>
                      {selectedAudio === x.name && (
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <CheckCircle2 className="w-4 h-4 fill-current" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time configuration preview card */}
              <div className="lg:col-span-5 bg-gradient-to-tr from-slate-900 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 flex flex-col justify-between space-y-8 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
                
                <div className="space-y-4">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-[#94A3B8]">Live Session Preview</p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400">Aromatherapy</p>
                      <p className="text-sm font-bold text-gradient flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span> {selectedAroma}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Lighting</p>
                      <p className="text-sm font-bold text-gradient flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> {selectedLight}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Audio</p>
                      <p className="text-sm font-bold text-gradient flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> {selectedAudio}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Animated Sound Wave Visualizer */}
                <div className="space-y-4 pt-6 border-t border-slate-800/80">
                  <div className="flex justify-center items-end gap-[3px] h-12">
                    {isMounted ? (
                      Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-primary to-secondary rounded-full wave-bar"
                          style={{
                            height: `${10 + (i * 7) % 80}%`,
                            animationDuration: `${0.6 + (i * 0.12) % 0.8}s`
                          }}
                        ></div>
                      ))
                    ) : (
                      Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-slate-800 rounded-full"
                          style={{ height: '30%' }}
                        ></div>
                      ))
                    )}
                  </div>
                  <p className="text-[10px] text-center text-slate-400 font-medium">Your sanctuary is tuned and ready</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. Trust Verification Matrix */}
        <section className="py-24 bg-[#F8FAFC] border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Why Nivara
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">
                A comprehensive <span className="text-gradient">trust verification matrix</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                Every aspect of the Nivara experience is engineered for your safety, convenience, and deepest possible relaxation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* Card 1 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Hyper-Local Cluster Booking</h3>
                  <p className="text-[#64748B] text-xs leading-relaxed">
                    Vans anchor efficiently at your apartment complex or tech park gate, eliminating urban transit times entirely. Your sanctuary is always a short walk away.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 bg-slate-100 text-[#64748B] text-[9px] font-bold rounded-full border border-slate-200">
                    • GPS-Precision Anchoring
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-[#64748B] text-[9px] font-bold rounded-full border border-slate-200">
                    • Zero Transit Time
                  </span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Quick-Burst Decompression</h3>
                  <p className="text-[#64748B] text-xs leading-relaxed">
                    Accessible 15, 30, and 45-minute high-impact relaxation options. Designed for busy schedules — step in, reset, and step out without disrupting your day.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 bg-slate-100 text-[#64748B] text-[9px] font-bold rounded-full border border-slate-200">
                    • Automated UV-C Sanitization Profiles
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-[#64748B] text-[9px] font-bold rounded-full border border-slate-200">
                    • 15-Min Express Available
                  </span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">IoT Smart-Access Check-In</h3>
                  <p className="text-[#64748B] text-xs leading-relaxed">
                    Frictionless, contact-free app-unlock experience. Simply approach the vehicle and slide-to-open via Bluetooth or QR code. Your session begins the moment you step in.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 bg-slate-100 text-[#64748B] text-[9px] font-bold rounded-full border border-slate-200">
                    • Active IoT Climate Logs
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-[#64748B] text-[9px] font-bold rounded-full border border-slate-200">
                    • Acoustic Soundproofing Tier-1
                  </span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Trusted Partner Safeguards</h3>
                  <p className="text-[#64748B] text-xs leading-relaxed">
                    Only highly-rated, background-checked vendors with proven digital and physical safety records are allowed on the platform. 100% secure, non-hazardous, verified professionals.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 bg-slate-100 text-[#64748B] text-[9px] font-bold rounded-full border border-slate-200">
                    • Background-Verified
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-[#64748B] text-[9px] font-bold rounded-full border border-slate-200">
                    • RTO-Certified Fleet
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. Pricing Session Grid */}
        <section className="py-24 bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight">
                Choose your session <span className="text-gradient">duration</span>
              </h2>
              <p className="text-slate-400 text-sm">
                Our pricing adapts to the time of day, with morning sessions offering the best value. Book now to secure your slot.
              </p>
              
              {/* Dynamic 1 slots available counter */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FDBA74]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] animate-ping"></span> 1 slots available
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
              
              {/* Time of Day Side-Selector Column */}
              <div className="lg:col-span-4 bg-[#F8FAFC] rounded-3xl p-6 border border-slate-200 flex flex-col gap-2">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-2">Select Time of Day</p>
                
                {[
                  { id: 'morning', label: 'Morning', sub: 'Energizing Reset Focus' },
                  { id: 'afternoon', label: 'Afternoon', sub: 'Peak Corporate Decompression' },
                  { id: 'evening', label: 'Evening', sub: 'Post-Work Metabolic Recovery' },
                  { id: 'night', label: 'Night', sub: 'Deep Sleep Prep Focus' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTimeOfDay(t.id as any)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      timeOfDay === t.id
                        ? 'bg-white border-primary shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-slate-150 hover:border-slate-200'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t.label}</p>
                      <p className="text-[9px] text-[#64748B]">{t.sub}</p>
                    </div>
                    {timeOfDay === t.id && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[8px] font-bold">✓</div>
                    )}
                  </button>
                ))}
              </div>

              {/* 3 Price Cards Grid */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                
                {/* Standard */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-6 hover:border-primary/50 transition-colors">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Standard Session</p>
                      <p className="text-[10px] text-slate-400">30 minutes</p>
                    </div>
                    <p className="text-2xl font-black text-slate-900">₹{getSessionPrice(30)}</p>
                    <ul className="space-y-2 text-[10px] font-medium text-slate-500">
                      <li className="flex items-center gap-1.5">✓ Zero-gravity massage chair</li>
                      <li className="flex items-center gap-1.5">✓ Standard aromatherapy</li>
                      <li className="flex items-center gap-1.5">✓ Climate-controlled cabin</li>
                      <li className="flex items-center gap-1.5">✓ Acoustic isolation</li>
                    </ul>
                  </div>
                  <Link
                    href="/customer/search"
                    className="w-full text-center py-2.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10px] transition-all"
                  >
                    Book 30 min
                  </Link>
                </div>

                {/* Extended */}
                <div className="bg-white p-6 rounded-3xl border border-primary relative flex flex-col justify-between space-y-6 shadow-md">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-secondary text-white text-[9px] font-black tracking-wider uppercase">
                    Most Popular
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Extended Session</p>
                      <p className="text-[10px] text-slate-400">45 minutes</p>
                    </div>
                    <p className="text-2xl font-black text-slate-900">₹{getSessionPrice(45)}</p>
                    <ul className="space-y-2 text-[10px] font-medium text-slate-500">
                      <li className="flex items-center gap-1.5">✓ Personalized aromatherapy</li>
                      <li className="flex items-center gap-1.5">✓ Custom haptic massage</li>
                      <li className="flex items-center gap-1.5">✓ Full chromotherapy</li>
                      <li className="flex items-center gap-1.5">✓ Spatial audio soundscape</li>
                    </ul>
                  </div>
                  <Link
                    href="/customer/search"
                    className="w-full text-center py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-[10px] transition-all shadow-sm"
                  >
                    Book 45 min
                  </Link>
                </div>

                {/* Premium */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-6 hover:border-primary/50 transition-colors">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Premium Session</p>
                      <p className="text-[10px] text-slate-400">60 minutes</p>
                    </div>
                    <p className="text-2xl font-black text-slate-900">₹{getSessionPrice(60)}</p>
                    <ul className="space-y-2 text-[10px] font-medium text-slate-500">
                      <li className="flex items-center gap-1.5">✓ Everything in Extended</li>
                      <li className="flex items-center gap-1.5">✓ Guided decompression</li>
                      <li className="flex items-center gap-1.5">✓ Premium essential oils</li>
                      <li className="flex items-center gap-1.5">✓ Wellness report doc</li>
                    </ul>
                  </div>
                  <Link
                    href="/customer/search"
                    className="w-full text-center py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-all"
                  >
                    Book 60 min
                  </Link>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* 5. Pathway Timeline Steps */}
        <section className="py-24 bg-[#F8FAFC] border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight">
                Your path to <span className="text-gradient">absolute reset</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                From discovery to deep relaxation — every step is engineered for frictionless, immersive wellness.
              </p>
            </div>

            <div className="relative max-w-3xl mx-auto">
              
              {/* Timeline Center Line */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent"></div>
              
              <div className="space-y-12">
                {/* Step 1 */}
                <div className="relative flex flex-col md:flex-row items-center justify-between">
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white shadow"></div>
                  
                  {/* Card Left */}
                  <div className="w-full md:w-[45%] bg-white p-6 rounded-3xl border border-slate-200 space-y-2 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-black text-primary/20">01</span>
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Sign Up</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Create a customer or vendor account. Vetting and verification processes ensure safety and compliance across the platform.
                    </p>
                  </div>
                  
                  {/* Empty Spacer Right */}
                  <div className="hidden md:block w-[45%]"></div>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col md:flex-row items-center justify-between">
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-secondary border-4 border-white shadow"></div>
                  
                  {/* Empty Spacer Left */}
                  <div className="hidden md:block w-[45%]"></div>

                  {/* Card Right */}
                  <div className="w-full md:w-[45%] bg-white p-6 rounded-3xl border border-slate-200 space-y-2 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-black text-secondary/20">02</span>
                      <Zap className="w-5 h-5 text-secondary" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Connect</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      IoT-enabled synchronization links active vans to surrounding tech clusters and neighborhoods in real-time.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col md:flex-row items-center justify-between">
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-4 border-white shadow"></div>
                  
                  {/* Card Left */}
                  <div className="w-full md:w-[45%] bg-white p-6 rounded-3xl border border-slate-200 space-y-2 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-black text-accent/20">03</span>
                      <CreditCard className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Transact</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Reserve slots, customize sensory details in-app, and execute secure cashless checkout transactions instantly.
                    </p>
                  </div>
                  
                  {/* Empty Spacer Right */}
                  <div className="hidden md:block w-[45%]"></div>
                </div>

                {/* Step 4 */}
                <div className="relative flex flex-col md:flex-row items-center justify-between">
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white shadow"></div>
                  
                  {/* Empty Spacer Left */}
                  <div className="hidden md:block w-[45%]"></div>

                  {/* Card Right */}
                  <div className="w-full md:w-[45%] bg-white p-6 rounded-3xl border border-slate-200 space-y-2 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-black text-primary/20">04</span>
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Grow</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Collect reviews, expand fleet capabilities, and drive high-impact wellness results across the network.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section className="py-24 bg-white border-b border-border" id="faq">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
              <p className="text-slate-400 text-sm">
                Everything you need to know about booking and hosting.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-3 text-xs text-[#0F172A]">
              {[
                {
                  q: "How do I verify my customer KYC?",
                  a: "After creating an account, navigate to the KYC tab in your dashboard. Upload any valid government ID card (Aadhaar, Passport, DL). Our system admin will verify your details in the approvals queue in under 10 minutes so you can book."
                },
                {
                  q: "What amenities are inside a Nivara Pod?",
                  a: "Each wellness van features a premium zero-gravity recliner, medical-grade acoustic noise insulation, spatial surround audio, HEPA air purifiers, and automated aromatherapy diffusers."
                },
                {
                  q: "How do payments and cancellations work?",
                  a: "Bookings are paid securely using credit/debit cards or netbanking via our mock Stripe checkout sandbox. You can cancel any booking before the slot starts from your dashboard, which triggers an automated refund."
                },
                {
                  q: "How do I become a host partner?",
                  a: "Register as a Host, complete your profile, and submit details of your wellness van. Once the founder approves your van listing, you can define availability slots and receive bookings."
                }
              ].map((faq, index) => (
                <div key={index} className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center p-5 font-bold text-left hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-lg font-normal text-[#64748B]">{faqOpen === index ? '−' : '+'}</span>
                  </button>
                  {faqOpen === index && (
                    <div className="p-5 pt-0 border-t border-slate-100 text-[#64748B] leading-relaxed animate-in fade-in-0 duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section id="contact" className="py-24 bg-[#F8FAFC] border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Get In Touch
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">Contact Us</h2>
              <p className="text-[#64748B] text-sm max-w-md mx-auto">
                Have questions about booking a van or partnering with us? We&apos;d love to hear from you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-stretch">
              
              {/* Contact Form */}
              <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs text-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#F8FAFC] px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-[#F8FAFC] px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Message</label>
                    <textarea 
                      rows={5}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Tell us how we can help you..."
                      className="w-full bg-[#F8FAFC] px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary resize-none"
                    ></textarea>
                  </div>
                  
                  {contactStatus === 'success' && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-medium">
                      ✓ Thank you! Your message has been saved. We will get back to you shortly.
                    </div>
                  )}
                  {contactStatus === 'error' && (
                    <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl font-medium">
                      ✕ Failed to submit. Please try again.
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={contactStatus === 'loading'}
                    className="w-full py-3 rounded-full bg-primary hover:bg-secondary text-white font-bold transition-all shadow-md shadow-primary/10 disabled:opacity-50 btn-premium"
                  >
                    {contactStatus === 'loading' ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              </div>

              {/* Office Details */}
              <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 flex flex-col justify-between space-y-8 shadow-lg">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#94A3B8] mb-1">Direct Support Email</p>
                    <p className="text-sm font-bold text-gradient">support.nivara@gmail.com</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#94A3B8] mb-1">Phone Helpline</p>
                    <p className="text-sm font-bold text-slate-300">*(will be provided later)*</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#94A3B8] mb-1">Office Headquarters</p>
                    <p className="text-sm font-bold text-slate-300">*(will be provided later)*</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-400 leading-relaxed font-medium">
                  Our live response team monitors contact submissions 24/7. Inquiries are generally processed in under 2 hours.
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 7. Platform Partnership Banner */}
        <section className="py-24 bg-white border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
              <div className="space-y-3 text-left">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  Vendor Network
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Own a Stress Relief Van?</h3>
                <p className="text-[#64748B] text-xs sm:text-sm max-w-xl leading-relaxed">
                  Join the Nivara marketplace. List your custom wellness vehicle, set your own schedule, and get connected instantly with corporate clients and local consumers.
                </p>
              </div>
              <Link 
                href="/login?role=vendor" 
                className="bg-primary hover:bg-secondary text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg shadow-primary/15 whitespace-nowrap text-xs btn-premium"
              >
                Become a Partner
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
