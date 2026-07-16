'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Clock, Volume2, VolumeX, Navigation, AlertTriangle, CheckCircle, Sparkles, X } from 'lucide-react';

interface ActiveBooking {
  id: string;
  sessionLength: number;
  vanId: string;
  van: {
    title: string;
    address: string;
    price15: number;
  };
  availability: {
    id: string;
    startTime: string;
    endTime: string;
  };
}

export default function ActiveSessionTracker() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
  const [percentElapsed, setPercentElapsed] = useState<number>(0);
  
  // Popup UI control states
  const [showEndingPopup, setShowEndingPopup] = useState(false);
  const [popupTriggeredForId, setPopupTriggeredForId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isEndingEarly, setIsEndingEarly] = useState(false);
  const [confirmEndStep, setConfirmEndStep] = useState(false);
  
  // Extension states
  const [extensionStatus, setExtensionStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'success'>('idle');
  const [nextSlotId, setNextSlotId] = useState<string | null>(null);
  const [extensionPrice, setExtensionPrice] = useState<number>(0);

  // Play synthetic meditation chime (wellness brand alert)
  const playWellnessChime = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now); // A4 (calm chime)
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now); // A5 (pleasant harmonic octave)
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.0);
      osc2.stop(now + 2.0);
    } catch (err) {
      console.log('Browser Autoplay blocked chime audio playback.', err);
    }
  };

  // Poll for active session every 10 seconds (minimal CPU drain)
  const fetchActiveSession = async () => {
    if (activeBooking?.id === 'demo-booking-id') return;

    try {
      const res = await fetch('/api/customer/active-session');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.activeBooking) {
          setActiveBooking(data.activeBooking);
        } else {
          setActiveBooking(null);
          setShowEndingPopup(false);
        }
      }
    } catch (err) {
      console.error('Failed to retrieve active session status:', err);
    }
  };

  useEffect(() => {
    const handleDemoEvent = () => {
      const mockBooking: ActiveBooking = {
        id: "demo-booking-id",
        sessionLength: 30,
        vanId: "demo-van-id",
        van: {
          title: "Wellness Pod - HSR Hub (Demo)",
          address: "Sector 4, HSR Layout, Bengaluru",
          price15: 350
        },
        availability: {
          id: "demo-slot-id",
          startTime: new Date(Date.now() - 21 * 60000).toISOString(),
          endTime: new Date(Date.now() + 9 * 60000).toISOString(),
        }
      };
      setActiveBooking(mockBooking);
      setPopupTriggeredForId(null);
    };

    window.addEventListener('trigger-demo-session', handleDemoEvent);

    if (typeof window !== 'undefined' && window.location.search.includes('demo=true')) {
      handleDemoEvent();
    }

    fetchActiveSession();
    const interval = setInterval(fetchActiveSession, 12000);

    return () => {
      window.removeEventListener('trigger-demo-session', handleDemoEvent);
      clearInterval(interval);
    };
  }, [pathname, activeBooking?.id]);

  // Handle countdown calculations
  useEffect(() => {
    if (!activeBooking) return;

    const calculateTimes = () => {
      const start = new Date(activeBooking.availability.startTime).getTime();
      const end = new Date(activeBooking.availability.endTime).getTime();
      const now = Date.now();
      
      if (now >= start && now <= end) {
        const total = end - start;
        const elapsed = now - start;
        const remainingSec = Math.max(0, Math.floor((end - now) / 1000));
        
        setTimeRemaining(remainingSec);
        setPercentElapsed(Math.min(100, (elapsed / total) * 100));

        // Trigger session ending popup 10 minutes (600 seconds) before session ends
        // (For testing purposes, trigger if remaining time is less than 600s, i.e., 10 mins)
        const TRIGGER_SECONDS = 600; 
        if (remainingSec <= TRIGGER_SECONDS && remainingSec > 0) {
          if (popupTriggeredForId !== activeBooking.id) {
            setShowEndingPopup(true);
            setPopupTriggeredForId(activeBooking.id);
            playWellnessChime();
          }
        }
      } else {
        // Session ended
        setActiveBooking(null);
        setShowEndingPopup(false);
      }
    };

    calculateTimes();
    const timer = setInterval(calculateTimes, 1000);
    return () => clearInterval(timer);
  }, [activeBooking, popupTriggeredForId, isMuted]);

  // End session early callback
  const handleEndSessionEarly = async () => {
    if (!activeBooking) return;
    try {
      const res = await fetch('/api/customer/active-session/end-early', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: activeBooking.id }),
      });
      if (res.ok) {
        setActiveBooking(null);
        setShowEndingPopup(false);
        setConfirmEndStep(false);
        alert("Hope you're feeling recharged! Your session has been completed early.");
        router.push('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Extend Session adjacent checks
  const handleCheckExtension = async () => {
    if (!activeBooking) return;
    setExtensionStatus('checking');
    try {
      const res = await fetch('/api/customer/active-session/check-extension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: activeBooking.id }),
      });
      const data = await res.json();
      if (data.success && data.available) {
        setNextSlotId(data.nextSlotId);
        setExtensionPrice(data.price);
        setExtensionStatus('available');
      } else {
        setExtensionStatus('unavailable');
      }
    } catch (err) {
      setExtensionStatus('unavailable');
    }
  };

  // Confirm extension payment flow
  const handleConfirmExtension = async () => {
    if (!activeBooking || !nextSlotId) return;
    try {
      const res = await fetch('/api/customer/active-session/confirm-extension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeBooking.id,
          nextSlotId,
          amount: extensionPrice,
        }),
      });
      if (res.ok) {
        setExtensionStatus('success');
        // Refresh active booking metadata
        fetchActiveSession();
        // Hide reminder popup
        setTimeout(() => {
          setShowEndingPopup(false);
          setExtensionStatus('idle');
        }, 2000);
      }
    } catch (err) {
      alert('Extension payment failed. Please try again.');
    }
  };

  if (!activeBooking) return null;

  const minutesLeft = Math.ceil(timeRemaining / 60);

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full space-y-4 font-sans text-xs">
      
      {/* 1. Persistent Session Status Bar */}
      <div className="bg-white border border-[#E5E1D8] shadow-lg rounded-2xl p-4 space-y-3 relative text-primary transition-all animate-in slide-in-from-left duration-300">
        <div className="flex justify-between items-start gap-2">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-secondary flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-secondary animate-pulse" /> Active Session
            </span>
            <h4 className="font-serif text-sm font-bold mt-0.5">{activeBooking.van.title}</h4>
          </div>
          <div className="text-right">
            <span className="font-mono text-sm font-bold text-secondary block">{minutesLeft} min left</span>
            <span className="text-[9px] text-slate-400 block font-medium">Ends at {new Date(activeBooking.availability.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-[#FAF8F5] border border-[#E5E1D8] h-2.5 rounded-full overflow-hidden">
            <div 
              style={{ width: `${percentElapsed}%` }} 
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000"
            ></div>
          </div>
          <div className="flex justify-between text-[8px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>Started</span>
            <span>{Math.round(percentElapsed)}% Elapsed</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center pt-2 border-t border-[#FAF8F5]">
          {confirmEndStep ? (
            <div className="flex items-center gap-2 w-full justify-between">
              <span className="text-[9px] text-red-600 font-bold">End early?</span>
              <div className="flex gap-1.5">
                <button 
                  onClick={handleEndSessionEarly}
                  className="bg-red-600 text-white font-bold px-2.5 py-1 rounded text-[10px] hover:bg-red-700 cursor-pointer"
                >
                  Yes, End
                </button>
                <button 
                  onClick={() => setConfirmEndStep(false)}
                  className="border border-[#E5E1D8] bg-white px-2 py-1 rounded text-[10px] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="text-[10px] text-muted-foreground font-medium">Enjoy your pod recovery</span>
              <button 
                onClick={() => setConfirmEndStep(true)}
                className="text-red-600 font-bold hover:underline cursor-pointer"
              >
                End Session Early
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Zomato/Swiggy-style Slide Up Chime Alert Popup */}
      {showEndingPopup && (
        <div className="bg-slate-900 text-slate-100 border border-slate-800 shadow-2xl rounded-2xl p-5 space-y-4 relative overflow-hidden transition-all animate-in slide-in-from-bottom-6 duration-500">
          {/* Top mute/dismiss indicators */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[9px] font-bold text-[#D4A373] uppercase tracking-wider flex items-center gap-1">
              <Bell className="w-3 h-3 text-[#D4A373] animate-bounce" /> Time running out
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (isMuted) playWellnessChime();
                }}
                title={isMuted ? "Unmute Alerts" : "Mute Alerts"}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={() => setShowEndingPopup(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Alert Message */}
          <div className="space-y-1">
            <h4 className="font-serif text-sm font-bold text-white">Session ending soon</h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Your recovery session ends in <span className="font-bold text-white">{minutesLeft} minutes</span>. I hope you are feeling recharged and focused!
            </p>
          </div>

          {/* Extensions form modules */}
          {extensionStatus === 'idle' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={handleCheckExtension}
                className="bg-[#2C5234] hover:bg-[#2C5234]/90 text-white font-bold py-2 rounded-xl transition-all shadow cursor-pointer text-center"
              >
                Extend Session
              </button>
              <button 
                onClick={() => setShowEndingPopup(false)}
                className="border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold py-2 rounded-xl transition-all text-center cursor-pointer"
              >
                I&apos;m All Set
              </button>
            </div>
          )}

          {extensionStatus === 'checking' && (
            <div className="text-center py-2 flex items-center justify-center gap-2 text-slate-400">
              <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-[#D4A373] rounded-full animate-spin"></span>
              <span>Checking slot availability...</span>
            </div>
          )}

          {extensionStatus === 'available' && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Adjacent 30-min Slot:</span>
                <span className="font-bold text-[#D4A373]">₹{extensionPrice}</span>
              </div>
              <p className="text-[9px] text-slate-500 leading-relaxed">
                Add +30 minutes immediately. Secure payment will route as a background token charge.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmExtension}
                  className="flex-grow py-1.5 bg-[#2C5234] hover:bg-[#2C5234]/90 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  Pay & Lock Extension
                </button>
                <button
                  onClick={() => setExtensionStatus('idle')}
                  className="px-3 py-1.5 border border-slate-800 text-slate-400 text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {extensionStatus === 'unavailable' && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-start gap-1.5 text-amber-500 font-bold text-[10px]">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Slot Already Reserved</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-normal">
                This van is booked right after your session — but there is another Nivara van nearby!
              </p>
              <Link
                href="/customer/search"
                onClick={() => setShowEndingPopup(false)}
                className="inline-block text-[10px] font-bold text-[#D4A373] hover:underline"
              >
                Explore Nearby Vans &rarr;
              </Link>
            </div>
          )}

          {extensionStatus === 'success' && (
            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl text-center space-y-1 text-green-500 font-bold animate-in zoom-in-95 duration-200">
              <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-500" />
              <div>Extension Added!</div>
              <p className="text-[9px] text-slate-400 font-normal">
                Your session time has been updated successfully.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
