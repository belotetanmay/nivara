'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Compass, ShieldCheck, Clock, Zap, MapPin, CheckCircle, Sparkles, 
  ArrowRight, CheckCircle2, Wind, Headphones, Sun, Activity, Volume2, 
  UserCheck, CreditCard, TrendingUp, DollarSign, Percent, Award, ShieldAlert,
  Map, HelpCircle
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dual marketing mode: 'individual' (B2C) vs 'vendor' (B2B)
  const [marketingMode, setMarketingMode] = useState<'individual' | 'vendor'>('individual');

  // B2C Sensory Customizer State
  const [calmTab, setCalmTab] = useState<'aroma' | 'light' | 'audio'>('aroma');
  const [selectedAroma, setSelectedAroma] = useState('Lavender');
  const [selectedLight, setSelectedLight] = useState('Sunset Copper');
  const [selectedAudio, setSelectedAudio] = useState('Binaural Beats');

  // Synchronize calm customizer presets to localStorage for checkout pre-selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nivara_calm_preset', JSON.stringify({
        scent: selectedAroma,
        lighting: selectedLight,
        audio: selectedAudio
      }));
    }
  }, [selectedAroma, selectedLight, selectedAudio]);

  // B2C Dynamic Pricing timeOfDay state
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  // Real-time Database Statistics
  const [stats, setStats] = useState({
    activeVans: 0,
    completedSessions: 0,
    averageRating: 0.0,
    loaded: false
  });

  useEffect(() => {
    fetch('/api/public-stats')
      .then(res => res.json())
      .then(data => {
        setStats({
          activeVans: data.activeVans || 0,
          completedSessions: data.completedSessions || 0,
          averageRating: data.averageRating || 0.0,
          loaded: true
        });
      })
      .catch(err => console.error('Failed to load public stats:', err));
  }, []);

  // B2C Neighborhood Check Map State
  const [neighborhoodSearchQuery, setNeighborhoodSearchQuery] = useState('');
  const [neighborhoodStatus, setNeighborhoodStatus] = useState<'idle' | 'found' | 'not-found' | 'waitlist-success' | 'waitlist-loading'>('idle');
  const [waitlistSociety, setWaitlistSociety] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistPhone, setWaitlistPhone] = useState('');

  // B2B Efficiency Model state
  const [b2bModelView, setB2bModelView] = useState<'traditional' | 'nivara'>('nivara');

  // General Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Interactive FAQ state
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

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

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNeighborhoodStatus('waitlist-loading');
    try {
      const messageText = `NEIGHBORHOOD WAITLIST ENROLLMENT:\nSociety Name: ${waitlistSociety}\nEmail: ${waitlistEmail}\nPhone: ${waitlistPhone}\nRequested Zone: ${neighborhoodSearchQuery}`;
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Waitlist Lead',
          email: waitlistEmail,
          message: messageText,
        }),
      });
      if (res.ok) {
        setNeighborhoodStatus('waitlist-success');
        setWaitlistSociety('');
        setWaitlistEmail('');
        setWaitlistPhone('');
      } else {
        setNeighborhoodStatus('not-found');
      }
    } catch {
      setNeighborhoodStatus('not-found');
    }
  };

  const handleNeighborhoodSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!neighborhoodSearchQuery.trim()) return;
    
    const query = neighborhoodSearchQuery.toLowerCase();
    // Supported seeded zones: Indiranagar, Koramangala
    if (query.includes('indira') || query.includes('kora') || query.includes('bangalore') || query.includes('bengaluru')) {
      setNeighborhoodStatus('found');
    } else {
      setNeighborhoodStatus('not-found');
    }
  };

  // Pricing multipliers based on time of day
  const getSessionPrice = (duration: 30 | 45 | 60) => {
    let base = 0;
    if (duration === 30) base = 299;
    else if (duration === 45) base = 449;
    else if (duration === 60) base = 599;

    let multiplier = 1.0;
    if (timeOfDay === 'morning') multiplier = 1.0;
    else if (timeOfDay === 'afternoon') multiplier = 1.15;
    else if (timeOfDay === 'evening') multiplier = 1.35;
    else if (timeOfDay === 'night') multiplier = 0.90;

    return Math.round(base * multiplier);
  };

  // No-op calculation logic removed to dashboard

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      <Navbar />

      <main className="flex-grow">
        
        {/* Global B2C / B2B Segment Toggle Switch */}
        <div className="bg-slate-900 py-3 flex justify-center border-b border-slate-800">
          <div className="flex items-center bg-slate-950 p-1 rounded-full border border-slate-800 relative w-64 select-none">
            {/* Sliding Backdrop */}
            <div 
              className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 shadow-sm"
              style={{
                left: marketingMode === 'individual' ? '4px' : 'calc(50% - 2px)',
                width: 'calc(50% - 2px)'
              }}
            />
            <button
              onClick={() => setMarketingMode('individual')}
              className={`flex-1 py-1.5 text-[10px] font-black rounded-full text-center transition-all z-10 ${
                marketingMode === 'individual' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              For Individuals
            </button>
            <button
              onClick={() => setMarketingMode('vendor')}
              className={`flex-1 py-1.5 text-[10px] font-black rounded-full text-center transition-all z-10 ${
                marketingMode === 'vendor' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              For Van Vendors
            </button>
          </div>
        </div>

        {/* 1. IoT Hero Section (Dual Mode) */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 px-4 py-20 text-center transition-all duration-500">
          {/* Ambient background video loop */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          >
            <source src="/video.mp4" type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/75 z-0"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 px-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/70 text-yellow-400 border border-yellow-400/35 backdrop-blur-sm shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> 
              {marketingMode === 'individual' ? 'IoT-Enabled On-Demand Wellness' : 'B2B Fleet Marketplace Partner Program'}
            </span>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-yellow-400 leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
              {marketingMode === 'individual' ? (
                <>Relax. Recharge.<br /><span className="text-yellow-300">Right at Your Doorstep.</span></>
              ) : (
                <>Power Your Fleet.<br /><span className="text-yellow-300">Scale Your Business.</span></>
              )}
            </h1>
            
            <p className="text-yellow-100/95 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-sans font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              {marketingMode === 'individual' ? (
                'Smart mobile recovery suites delivering climate-controlled, synchronized bio-hacking therapies directly to your doorstep via real-time cloud automation.'
              ) : (
                'List your custom-retrofitted stress relief van on the Nivara marketplace. Set your own schedules, tap into corporate clusters, and watch your business grow.'
              )}
            </p>
            
            <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-xs sm:max-w-md mx-auto">
              {marketingMode === 'individual' ? (
                <>
                  <a
                    href="#neighborhood-search"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-bold text-slate-950 bg-gradient-to-r from-yellow-400 to-yellow-300 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/35 transition-all gap-2 btn-premium"
                  >
                    Find Nearest Van
                  </a>
                  <Link
                    href="/customer/search"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-bold text-white border border-white/30 bg-white/5 hover:bg-white/10 transition-all gap-2"
                  >
                    Browse Fleet
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login?role=vendor"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-bold text-slate-950 bg-gradient-to-r from-yellow-400 to-yellow-300 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/35 transition-all gap-2 btn-premium"
                  >
                    Become a Partner
                  </Link>
                  <Link
                    href="/login?role=vendor"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-bold text-white border border-white/30 bg-white/5 hover:bg-white/10 transition-all gap-2"
                  >
                    Calculate Revenue
                  </Link>
                </>
              )}
            </div>

            {/* Social proof metric chips */}
            <div className="flex flex-wrap justify-center items-center gap-4 pt-4 opacity-95 text-yellow-100/90 text-[10px] font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 bg-slate-950/70 px-4 py-2 rounded-full border border-yellow-400/20 backdrop-blur-sm shadow-md">
                <span className="flex h-2 w-2 rounded-full bg-[#7FD6B5] animate-ping"></span>
                <span>{stats.completedSessions} sessions completed</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/70 px-4 py-2 rounded-full border border-yellow-400/20 backdrop-blur-sm shadow-md">
                <div className="flex text-amber-400">★★★★★</div>
                <span>{stats.averageRating > 0 ? `Avg. rating: ${stats.averageRating}/5` : 'No ratings yet'}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/70 px-4 py-2 rounded-full border border-yellow-400/20 backdrop-blur-sm shadow-md">
                <Compass className="w-3 h-3 text-primary animate-spin-slow" />
                <span>{stats.activeVans} active vans stationed</span>
              </div>
            </div>
          </div>
        </section>

        {/* B2C Dynamic Content Block */}
        {marketingMode === 'individual' && (
          <div key="individual" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 2. Choose Your Calm Widget */}
            <section id="about" className="py-24 bg-white border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    Choose Your <span className="text-gradient">Calm</span>
                  </h2>
                  <p className="text-[#64748B] text-xs max-w-xl mx-auto">
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
                        { name: 'Lavender', desc: 'Deep relaxation & sleep preparation cycles', color: 'text-purple-500' },
                        { name: 'Eucalyptus', desc: 'Mental focus, refresh, and sinus opening', color: 'text-emerald-500' },
                        { name: 'Citrus', desc: 'Energizing dopamine release and mood lift', color: 'text-amber-500' }
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
                        { name: 'Sunset Copper', desc: 'Warm ambient glow focusing on red tones', color: 'text-amber-500' },
                        { name: 'Ocean Deep', desc: 'Calming soft indigo & oceanic teal vibes', color: 'text-blue-500' },
                        { name: 'Forest Neon', desc: 'Vibrant bioactive green for cognitive lift', color: 'text-emerald-500' }
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
                        { name: 'Binaural Beats', desc: 'Theta frequency brainwave synchronization', color: 'text-blue-500' },
                        { name: 'Rain Over Cabin', desc: 'Cozy acoustic rain sound masking', color: 'text-indigo-500' },
                        { name: 'Guided Decompression', desc: 'Soft breathing instructions with music', color: 'text-purple-500' }
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

                  {/* Real-time sensory preview card */}
                  <div className="lg:col-span-5 bg-gradient-to-tr from-slate-900 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 flex flex-col justify-between space-y-8 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-48 h-48 bg-primary/15 rounded-full blur-3xl"></div>
                    
                    <div className="space-y-4">
                      <p className="text-[9px] uppercase font-bold tracking-widest text-[#94A3B8]">Live Preset Setup</p>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] text-slate-400">Aromatherapy</p>
                          <p className="text-sm font-bold text-gradient flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span> {selectedAroma}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Lighting</p>
                          <p className="text-sm font-bold text-gradient flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> {selectedLight}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Audio</p>
                          <p className="text-sm font-bold text-gradient flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> {selectedAudio}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sound Wave Visualizer */}
                    <div className="space-y-4 pt-6 border-t border-slate-800/80">
                      <div className="flex justify-center items-end gap-[3px] h-12">
                        {isMounted ? (
                          Array.from({ length: 24 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-gradient-to-t from-primary to-secondary rounded-full wave-bar animate-pulse"
                              style={{
                                height: `${15 + (i * 7) % 75}%`,
                                animationDuration: `${0.5 + (i * 0.1) % 0.7}s`
                              }}
                            ></div>
                          ))
                        ) : (
                          <div className="w-full text-center text-slate-600 text-xs">Equalizer Offline</div>
                        )}
                      </div>
                      <p className="text-[9px] text-center text-[#7FD6B5] font-black uppercase tracking-wider">Sync Active & Registered</p>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* 3. Pricing Session Grid */}
            <section className="py-24 bg-[#F8FAFC] border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Choose Your Session <span className="text-gradient">Duration</span>
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Our dynamic pricing engine adapts to peak hours. Toggle the time segment below to review calculations.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
                  
                  {/* Time of Day Slider Segment */}
                  <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 flex flex-col gap-2 shadow-sm">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-2">Select Booking Slot Segment</p>
                    
                    {[
                      { id: 'morning', label: 'Morning (9 AM - 12 PM)', sub: 'Standard Rate (× 1.00)' },
                      { id: 'afternoon', label: 'Afternoon (12 PM - 4 PM)', sub: 'Lunch Demand (× 1.15)' },
                      { id: 'evening', label: 'Evening (4 PM - 9 PM)', sub: 'Peak Commute (× 1.35)' },
                      { id: 'night', label: 'Night (9 PM - 12 AM)', sub: 'Decompression Discount (× 0.90)' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTimeOfDay(t.id as any)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          timeOfDay === t.id
                            ? 'bg-[#F8FAFC] border-primary shadow-sm'
                            : 'bg-transparent border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{t.label}</p>
                          <p className="text-[9px] text-[#64748B]">{t.sub}</p>
                        </div>
                        {timeOfDay === t.id && (
                          <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Pricing Cards Column */}
                  <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                    {[
                      { title: 'Standard Session', min: 30, desc: 'Ideal for quick breathers', features: ['Zero-gravity seating', 'Sensory customizer access', '15-min post cycle cleanup'] },
                      { title: 'Extended Session', min: 45, desc: 'Deep recovery cycle', features: ['Full sensory sync presets', 'Extended haptic massage', 'Acoustic masking engine', 'HEPA filter oxygenation'], highlight: true },
                      { title: 'Premium Session', min: 60, desc: 'Maximum metabolic reset', features: ['All extended options', 'Immune sound guide', 'Aroma blend reserve bottles', 'Cognitive wellness report'] }
                    ].map((card) => (
                      <div 
                        key={card.min} 
                        className={`bg-white p-6 rounded-3xl border flex flex-col justify-between space-y-6 shadow-sm transition-all ${
                          card.highlight ? 'border-primary relative ring-2 ring-primary/10 shadow-md' : 'border-slate-200'
                        }`}
                      >
                        {card.highlight && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-secondary text-slate-900 text-[8px] font-black uppercase tracking-wider">
                            Recommended
                          </span>
                        )}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{card.title}</h4>
                            <p className="text-[10px] text-slate-400">{card.min} minutes</p>
                          </div>
                          
                          <div>
                            <span className="text-3xl font-black text-slate-900">₹{getSessionPrice(card.min as any)}</span>
                            <span className="text-[10px] text-slate-400 block mt-1">{card.desc}</span>
                          </div>

                          <ul className="space-y-2 text-[9px] font-semibold text-slate-500 border-t border-slate-100 pt-4">
                            {card.features.map((f, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-secondary flex-shrink-0" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Link
                          href="/customer/search"
                          className={`w-full text-center py-2.5 rounded-full font-bold text-[10px] transition-all ${
                            card.highlight 
                              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:opacity-95' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Book {card.min} mins
                        </Link>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </section>

            {/* 4. Pathway Timeline Steps */}
            <section id="how-it-works" className="py-24 bg-white border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Your Path to <span className="text-gradient">Absolute Reset</span>
                  </h2>
                  <p className="text-slate-400 text-xs">
                    From booking discovery to secure Bluetooth cabin access.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                  {[
                    { step: '01', title: 'Discover', desc: 'Find certified vans stationed near your home or office tech cluster.' },
                    { step: '02', title: 'Customize', desc: 'Configure aroma, audio, and light presets directly on your mobile dashboard.' },
                    { step: '03', title: 'IoT Unlock', desc: 'Scan the door QR code on approach to verify credentials and release the lock.' },
                    { step: '04', title: 'Reset', desc: 'Sink into luxury zero-gravity seats and let automated recovery cycles refresh you.' }
                  ].map((s) => (
                    <div key={s.step} className="bg-[#F8FAFC] border border-slate-200/80 p-6 rounded-3xl space-y-3 shadow-sm hover:translate-y-[-2px] transition-all">
                      <span className="text-2xl font-black text-[#5B8DEF]/30">{s.step}</span>
                      <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Neighborhood Waitlist Check Map Section */}
            <section id="neighborhood-search" className="py-24 bg-[#F8FAFC] border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    Live Map
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Is Nivara in Your <span className="text-gradient">Neighborhood?</span>
                  </h2>
                  <p className="text-[#64748B] text-xs">
                    Search your residential society or workplace cluster to view active vans in your region.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
                  
                  {/* Left Interactive Search Box & Output Panel */}
                  <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-bold text-base text-slate-900">Neighborhood Status Check</h3>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Input your locality (e.g. Indiranagar, Koramangala) to check for active anchor points. If not active yet, suggest it to your society using our waitlist module.
                      </p>
                      
                      <form onSubmit={handleNeighborhoodSearch} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={neighborhoodSearchQuery}
                          onChange={(e) => setNeighborhoodSearchQuery(e.target.value)}
                          placeholder="e.g. Whitefield"
                          className="flex-grow bg-[#F8FAFC] px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs text-slate-800 font-semibold"
                        />
                        <button
                          type="submit"
                          className="bg-primary hover:bg-secondary text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Check
                        </button>
                      </form>
                    </div>

                    {/* Search Outcomes */}
                    <div className="border-t border-slate-100 pt-6 flex-grow">
                      {neighborhoodStatus === 'idle' && (
                        <p className="text-xs text-slate-400 italic">Enter a neighborhood above to view local station status.</p>
                      )}

                      {neighborhoodStatus === 'found' && (
                        <div className="space-y-3 animate-in fade-in-0 duration-200">
                          <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-2xl text-xs font-semibold">
                            ✓ Nivara is Active! 3 stationed hubs found near your location.
                          </div>
                          <Link
                            href="/customer/search"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary"
                          >
                            Go to search panel and reserve slots <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      {(neighborhoodStatus === 'not-found' || neighborhoodStatus === 'waitlist-loading' || neighborhoodStatus === 'waitlist-success') && (
                        <div className="space-y-4 animate-in fade-in-0 duration-200">
                          {neighborhoodStatus !== 'waitlist-success' ? (
                            <>
                              <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl text-xs font-medium">
                                ⚠ Local hubs are not stationed in &quot;{neighborhoodSearchQuery}&quot; yet.
                              </div>
                              <form onSubmit={handleWaitlistSubmit} className="space-y-3 text-[10px] text-slate-800">
                                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Demand Nivara For Your Society</h4>
                                <div>
                                  <label className="block text-slate-600 font-semibold mb-1">Society / Tech Park Name</label>
                                  <input
                                    type="text"
                                    required
                                    value={waitlistSociety}
                                    onChange={(e) => setWaitlistSociety(e.target.value)}
                                    placeholder="e.g. Prestige Shantiniketan"
                                    className="w-full bg-[#F8FAFC] px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-slate-600 font-semibold mb-1">Contact Email</label>
                                    <input
                                      type="email"
                                      required
                                      value={waitlistEmail}
                                      onChange={(e) => setWaitlistEmail(e.target.value)}
                                      placeholder="you@domain.com"
                                      className="w-full bg-[#F8FAFC] px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-600 font-semibold mb-1">Contact Phone</label>
                                    <input
                                      type="tel"
                                      required
                                      value={waitlistPhone}
                                      onChange={(e) => setWaitlistPhone(e.target.value)}
                                      placeholder="99999 99999"
                                      className="w-full bg-[#F8FAFC] px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
                                    />
                                  </div>
                                </div>
                                <button
                                  type="submit"
                                  disabled={neighborhoodStatus === 'waitlist-loading'}
                                  className="w-full py-2 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-all shadow cursor-pointer disabled:opacity-50"
                                >
                                  {neighborhoodStatus === 'waitlist-loading' ? 'Enrolling Society...' : 'Submit Society Demand'}
                                </button>
                              </form>
                            </>
                          ) : (
                            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold space-y-1">
                              <p className="font-bold">✓ society demand registered!</p>
                              <p className="text-[10px] text-emerald-600 font-normal leading-relaxed">
                                We have saved your locality waitlist request. Once we secure 5 nearby client requests, we will station a wellness van in your society.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Stylized Mock Map Graphic with Percentage Coordinate Pins */}
                  <div className="lg:col-span-7 bg-[#EAE6DF] border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[350px] relative">
                    {/* Grid Backdrop simulating street layout */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                    
                    {/* SVG Map Lines */}
                    <svg className="absolute inset-0 w-full h-full text-white/50" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 0 100 Q 150 150 300 100 T 600 200" fill="none" stroke="currentColor" strokeWidth="8" />
                      <path d="M 100 0 L 120 400" fill="none" stroke="currentColor" strokeWidth="6" />
                      <path d="M 450 0 L 400 400" fill="none" stroke="currentColor" strokeWidth="6" />
                      <path d="M 0 300 L 600 250" fill="none" stroke="currentColor" strokeWidth="10" />
                    </svg>

                    {/* Locality Pin Points */}
                    {/* Indiranagar Cluster Pin */}
                    <div className="absolute top-[28%] left-[22%] z-10 group">
                      <span className="flex h-3.5 w-3.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary shadow border-2 border-white"></span>
                      </span>
                      <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-[8px] px-2 py-0.5 rounded shadow whitespace-nowrap opacity-90">
                        Indiranagar Cluster (Active)
                      </div>
                    </div>

                    {/* Koramangala Cluster Pin */}
                    <div className="absolute top-[62%] left-[64%] z-10 group">
                      <span className="flex h-3.5 w-3.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-secondary shadow border-2 border-white"></span>
                      </span>
                      <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-[8px] px-2 py-0.5 rounded shadow whitespace-nowrap opacity-90">
                        Koramangala Station (Active)
                      </div>
                    </div>

                    {/* Bangalore Tech Park Cluster Pin */}
                    <div className="absolute top-[40%] left-[45%] z-10 group">
                      <span className="flex h-3.5 w-3.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent shadow border-2 border-white"></span>
                      </span>
                      <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-[8px] px-2 py-0.5 rounded shadow whitespace-nowrap opacity-90">
                        HSR Hub (Active)
                      </div>
                    </div>

                    {/* User Pin if local query matches Bangalore */}
                    {neighborhoodStatus === 'found' && (
                      <div className="absolute top-[50%] left-[30%] z-20 animate-bounce">
                        <span className="flex h-5 w-5 bg-red-500 rounded-full items-center justify-center text-white border-2 border-white shadow font-bold text-[8px]">
                          ★
                        </span>
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white font-bold text-[9px] px-2 py-1 rounded shadow whitespace-nowrap">
                          Your Queried Zone
                        </div>
                      </div>
                    )}

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur text-white text-[9px] font-bold p-3 rounded-xl border border-white/10 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block border border-white/20"></span>
                        <span>Corporate Tech Clusters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block border border-white/20"></span>
                        <span>Residential Societies</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>
          </div>
        )}
         {/* B2B Dynamic Content Block */}
        {marketingMode === 'vendor' && (
          <div key="vendor" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* B2B Animated Efficiency Comparison (Stationary vs. Transit) */}
            <section id="efficiency-comparison" className="py-24 bg-white border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    Model Efficiency
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    Transit vs. <span className="text-gradient">Stationary Cluster</span> Model
                  </h2>
                  <p className="text-[#64748B] text-xs max-w-xl mx-auto">
                    Toggle below to compare the operational dynamics and carbon-efficiency of traditional call-and-run mobile services versus Nivara&apos;s parked cluster model.
                  </p>
                </div>

                {/* Switch Toggle */}
                <div className="flex justify-center mb-12">
                  <div className="bg-slate-100 p-1 rounded-full border border-slate-200 flex select-none">
                    <button
                      type="button"
                      onClick={() => setB2bModelView('traditional')}
                      className={`px-6 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                        b2bModelView === 'traditional'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Traditional Mobile Service
                    </button>
                    <button
                      type="button"
                      onClick={() => setB2bModelView('nivara')}
                      className={`px-6 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                        b2bModelView === 'nivara'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Nivara Clustered Model
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
                  
                  {/* Left Column: Animated Visualization Map */}
                  <div className="lg:col-span-7 bg-slate-950 rounded-3xl p-8 border border-slate-800 flex flex-col justify-between relative overflow-hidden min-h-[350px] shadow-lg">
                    {/* Visualizer Header */}
                    <div className="z-10">
                      <h3 className="text-sm font-bold text-white">Route Network Visualization</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Simulated operational map for 8 daily booking points.</p>
                    </div>

                    {/* Animated Canvas */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {b2bModelView === 'traditional' ? (
                        /* Traditional Route Animation */
                        <svg className="w-full h-full p-12 max-h-[250px]" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Chaotic Route Path */}
                          <path d="M30 150 L110 50 L180 160 L240 40 L300 150 L370 70" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
                          
                          {/* Scattered Booking Pins */}
                          <circle cx="30" cy="150" r="5" fill="#EF4444" className="animate-ping" />
                          <circle cx="30" cy="150" r="4" fill="#EF4444" />
                          <circle cx="110" cy="50" r="4" fill="#EF4444" />
                          <circle cx="180" cy="160" r="4" fill="#EF4444" />
                          <circle cx="240" cy="40" r="4" fill="#EF4444" />
                          <circle cx="300" cy="150" r="4" fill="#EF4444" />
                          <circle cx="370" cy="70" r="4" fill="#EF4444" />

                          {/* Darting Van Icon */}
                          <g className="animate-bounce">
                            <rect x="180" y="80" width="18" height="10" rx="2" fill="#94A3B8" />
                            <circle cx="184" cy="90" r="2" fill="#000" />
                            <circle cx="194" cy="90" r="2" fill="#000" />
                          </g>

                          {/* Traditional Text Legend */}
                          <text x="10" y="20" fill="#EF4444" fontSize="8" fontWeight="bold">Jittery Route: 82.5 km total travel</text>
                        </svg>
                      ) : (
                        /* Nivara Clustered Route Animation */
                        <svg className="w-full h-full p-12 max-h-[250px]" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Central Stationed Circle Hub */}
                          <circle cx="200" cy="100" r="35" fill="none" stroke="#7FD6B5" strokeWidth="1" strokeDasharray="3 3" />
                          <circle cx="200" cy="100" r="12" fill="#7FD6B5" fillOpacity="0.2" />
                          <circle cx="200" cy="100" r="6" fill="#7FD6B5" />
                          
                          {/* Pulsing Booking Pins around the cluster hub */}
                          <g className="animate-pulse">
                            <circle cx="170" cy="80" r="4" fill="#7FD6B5" />
                            <circle cx="230" cy="70" r="4" fill="#7FD6B5" />
                            <circle cx="180" cy="125" r="4" fill="#7FD6B5" />
                            <circle cx="220" cy="120" r="4" fill="#7FD6B5" />
                          </g>

                          {/* Direct Short Route Path */}
                          <path d="M40 100 L180 100" stroke="#5B8DEF" strokeWidth="2.5" />
                          
                          {/* Stationed Van at Hub */}
                          <g transform="translate(191, 95)">
                            <rect width="18" height="10" rx="2" fill="#5B8DEF" />
                            <circle cx="4" cy="10" r="2" fill="#000" />
                            <circle cx="14" cy="10" r="2" fill="#000" />
                          </g>

                          {/* Direct Route Van entering Hub */}
                          <text x="10" y="20" fill="#7FD6B5" fontSize="8" fontWeight="bold">Optimized Transit: 7.2 km travel to anchor point</text>
                        </svg>
                      )}
                    </div>

                    {/* Status Alert Indicator */}
                    <div className="z-10 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Simulation Status:</span>
                      <span className={b2bModelView === 'nivara' ? 'text-secondary font-bold' : 'text-rose-500 font-bold'}>
                        {b2bModelView === 'nivara' ? '✓ High Utilization Stationed' : '✕ High Wear & Fuel Waste'}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Comparative Metrics & Register CTA */}
                  <div className="lg:col-span-5 bg-gradient-to-tr from-slate-900 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 flex flex-col justify-between space-y-8 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-48 h-48 bg-secondary/15 rounded-full blur-3xl"></div>
                    
                    <div className="space-y-3 text-center">
                      <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Metrics Breakdown</h4>
                      <p className="text-[10px] text-slate-400">Comparing operational footprint for a single vehicle daily slot.</p>
                    </div>

                    {/* Comparative Counters */}
                    <div className="space-y-4 pt-4 border-t border-slate-800/80">
                      <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                        <div>
                          <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">Avg. Daily Transit Distance</span>
                          <span className="text-xl font-bold font-serif text-slate-100 mt-1 block transition-all duration-300">
                            {b2bModelView === 'nivara' ? '8 km' : '75 km'}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b2bModelView === 'nivara' ? 'bg-secondary/10 text-secondary' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {b2bModelView === 'nivara' ? '-89% fuel cost' : 'High wear'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                        <div>
                          <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">Effective Fleet Utilization</span>
                          <span className="text-xl font-bold font-serif text-slate-100 mt-1 block transition-all duration-300">
                            {b2bModelView === 'nivara' ? '85%' : '30%'}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b2bModelView === 'nivara' ? 'bg-secondary/10 text-secondary' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {b2bModelView === 'nivara' ? 'Maximize ROI' : 'Idling gap'}
                        </span>
                      </div>
                    </div>

                    {/* Teaser copy & Sign Up */}
                    <div className="space-y-4 pt-6 border-t border-slate-800/85 text-center">
                      <p className="text-[10px] text-slate-400 leading-normal">
                        <strong>Want to calculate your exact payout?</strong> Host partners get access to our live B2B Revenue calculator tool on their private dashboard, synced to active regional booking metrics.
                      </p>
                      <Link
                        href="/login?role=vendor"
                        className="w-full block py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all btn-premium-action text-center"
                      >
                        Register Fleet to See Calculator
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* B2B How it Works (4 Steps) */}
            <section id="how-it-works" className="py-24 bg-[#F8FAFC] border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Partner Fleet Onboarding <span className="text-gradient">Timeline</span>
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Four steps to launch your vehicle and scale client bookings.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                  {[
                    { step: '01', title: 'Register Fleet', desc: 'Submit business license, registration certificate, and interior/exterior layout photos.' },
                    { step: '02', title: 'Set Schedules', desc: 'Define calendar slot dates, active service hours, and geographic delivery radius.' },
                    { step: '03', title: 'Accept Bookings', desc: 'Collect reservation alerts automatically when nearby corporate and private users book slots.' },
                    { step: '04', title: 'Scale Business', desc: 'Review client feedback stars, monitor daily occupancy analytics, and add more vehicles.' }
                  ].map((s) => (
                    <div key={s.step} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-sm hover:translate-y-[-2px] transition-all">
                      <span className="text-2xl font-black text-secondary/30">{s.step}</span>
                      <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* B2B Advantage Grid */}
            <section id="about" className="py-24 bg-white border-b border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-slate-900 border border-secondary/20">
                    Advantages
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Why partner with <span className="text-gradient">Nivara Network?</span>
                  </h2>
                  <p className="text-slate-400 text-xs">
                    We handle scheduling, route clearing, payments, and client acquisition. You focus on wellness.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {[
                    { icon: DollarSign, title: 'Cashless Payouts Ledger', desc: 'Earned revenues are consolidated in real-time and cleared directly to your bank account weekly.' },
                    { icon: Percent, title: 'Corporate Cluster Access', desc: 'Exclusive access to corporate parks, multi-tenant tech offices, and high-density apartments.' },
                    { icon: Award, title: 'Certified Compliance Hub', desc: 'We provide guidelines, cabin safety inspections, and RTO certification assistance.' }
                  ].map((adv, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200/80 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-[#7FD6B5]/20 flex items-center justify-center text-slate-900">
                          <adv.icon className="w-5 h-5 text-slate-800" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{adv.title}</h3>
                        <p className="text-[#64748B] text-xs leading-relaxed">{adv.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 6. FAQ Section */}
        <section className="py-24 bg-white border-b border-border" id="faq">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
              <p className="text-slate-400 text-xs">
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
              <p className="text-[#64748B] text-xs max-w-md mx-auto">
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
                    className="w-full py-3 rounded-full bg-primary hover:bg-secondary text-white font-bold transition-all shadow-md shadow-primary/10 disabled:opacity-50 btn-premium cursor-pointer"
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
                    <p className="text-sm font-bold text-slate-300">*(will be provided post-pilot)*</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#94A3B8] mb-1">Office Headquarters</p>
                    <p className="text-sm font-bold text-slate-300">*(will be provided post-pilot)*</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-400 leading-relaxed font-medium">
                  Our live response team monitors contact submissions 24/7. Inquiries are generally processed in under 2 hours.
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
