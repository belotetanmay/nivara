'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, MapPin, Inbox, CreditCard, ShieldCheck, AlertTriangle, ArrowUpRight, BarChart3, ChevronDown, ChevronUp, Compass, Navigation, Sparkles, FileText } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface Booking {
  id: string;
  bookingCode: string;
  sessionLength: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  scent: string;
  lighting: string;
  audio: string;
  serviceModel: string;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  customer: {
    name: string;
    email: string;
    phone: string | null;
    kycStatus: string;
  };
  van: {
    title: string;
    address: string;
  };
  availability: {
    startTime: string;
    endTime: string;
  };
  payment: {
    amount: number;
    status: string;
  } | null;
}

interface VendorProfile {
  id: string;
  businessName: string;
  bio: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason: string | null;
  payoutDetails: string;
  ratingAvg: number;
  totalBookings: number;
  businessLicenseNo: string | null;
}

export default function VendorDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<any>({
    totalEarnings: 0,
    vendorEarnings: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    completedSessionsCount: 0,
    utilizationRate: 0,
    payoutDetails: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showPastSessions, setShowPastSessions] = useState(false);
  const [completingBookingId, setCompletingBookingId] = useState<string | null>(null);
  const [actualDurationInput, setActualDurationInput] = useState<number>(30);
  const [vans, setVans] = useState<any[]>([]);
  const [simulatingVanId, setSimulatingVanId] = useState<string | null>(null);
  const [gpsIntervalId, setGpsIntervalId] = useState<any>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasRealKey = !!(apiKey && !apiKey.includes('Mock') && !apiKey.startsWith('AIzaSyMock'));
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places'] as any,
  });
  const [sessionEndingAlert, setSessionEndingAlert] = useState<any | null>(null);
  const [alertChimeTriggeredId, setAlertChimeTriggeredId] = useState<string | null>(null);

  // Play synthetic wellness chime for vendor alert
  const playVendorChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5 (warm note)
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 1.7);
    } catch (err) {
      console.log('Chime blocked by browser autoplay policy.', err);
    }
  };

  useEffect(() => {
    if (bookings.length === 0) return;

    const checkActiveSessionsAlert = () => {
      const now = Date.now();
      
      // Find any confirmed booking active right now
      const activeSession = bookings.find((b) => {
        if (b.status !== 'CONFIRMED') return false;
        const start = new Date(b.availability.startTime).getTime();
        const end = new Date(b.availability.endTime).getTime();
        return now >= start && now <= end;
      });

      if (activeSession) {
        const end = new Date(activeSession.availability.endTime).getTime();
        const remainingSeconds = Math.max(0, Math.floor((end - now) / 1000));
        
        // 10 minutes (600 seconds) warning threshold
        if (remainingSeconds <= 600 && remainingSeconds > 0) {
          setSessionEndingAlert({
            booking: activeSession,
            remainingSeconds
          });
          
          if (alertChimeTriggeredId !== activeSession.id) {
            playVendorChime();
            setAlertChimeTriggeredId(activeSession.id);
          }
          return;
        }
      }
      
      setSessionEndingAlert(null);
    };

    checkActiveSessionsAlert();
    const interval = setInterval(checkActiveSessionsAlert, 5000);
    return () => clearInterval(interval);
  }, [bookings, alertChimeTriggeredId]);

  const fetchVansData = async () => {
    try {
      const res = await fetch('/api/vendor/vans');
      const data = await res.json();
      if (res.ok && data.success) {
        setVans(data.vans || []);
      }
    } catch (e) {
      console.error('Failed to load vendor vans:', e);
    }
  };

  const startGpsSimulation = (vanId: string) => {
    if (simulatingVanId) {
      clearInterval(gpsIntervalId);
    }
    setSimulatingVanId(vanId);

    // Initial coordinates in Mumbai Bandra region
    let lat = 19.0596;
    let lng = 72.8295;

    const interval = setInterval(async () => {
      lat += (Math.random() - 0.5) * 0.0015;
      lng += (Math.random() - 0.5) * 0.0015;

      try {
        const res = await fetch(`/api/vendor/vans/${vanId}/gps`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentLatitude: lat, currentLongitude: lng }),
        });
        if (res.ok) {
          setVans(prev => prev.map(v => v.id === vanId ? { ...v, currentLatitude: lat, currentLongitude: lng } : v));
        }
      } catch (err) {
        console.error('Failed to send dynamic GPS update:', err);
      }
    }, 4000);

    setGpsIntervalId(interval);
  };

  const stopGpsSimulation = async (vanId: string) => {
    if (simulatingVanId === vanId) {
      clearInterval(gpsIntervalId);
      setSimulatingVanId(null);
      setGpsIntervalId(null);
    }

    try {
      const res = await fetch(`/api/vendor/vans/${vanId}/gps`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentLatitude: null, currentLongitude: null }),
      });
      if (res.ok) {
        setVans(prev => prev.map(v => v.id === vanId ? { ...v, currentLatitude: null, currentLongitude: null } : v));
      }
    } catch (err) {
      console.error('Failed to reset GPS coordinates:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (gpsIntervalId) clearInterval(gpsIntervalId);
    };
  }, [gpsIntervalId]);
  const [projectedVans, setProjectedVans] = useState(1);
  const [projectedRate, setProjectedRate] = useState(500);
  const [projectedHours, setProjectedHours] = useState(6);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/vendor/dashboard');
      const data = await res.json();
      if (res.ok && data.success) {
        setVendorProfile(data.vendorProfile);
        setBookings(data.bookings || []);
        setEarnings(data.earnings);
      } else {
        setError(data.error || 'Failed to load dashboard data.');
      }
    } catch (err) {
      setError('An error occurred loading vendor dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchDashboardData();
        fetchVansData();
      } else {
        router.push('/login');
      }
    }
  }, [user, authLoading]);

  const handleConfirmBooking = async (bookingId: string) => {
    setUpdatingId(bookingId);
    setError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/vendor/bookings/${bookingId}/confirm`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess('Booking confirmed successfully.');
        await fetchDashboardData();
      } else {
        setError(data.error || 'Failed to confirm booking.');
      }
    } catch (err) {
      setError('Error confirming session.');
    } finally {
      setUpdatingId(null);
    }
  };
  const handleRejectBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to decline this booking request? This will release the time slot and refund the client.')) {
      return;
    }
    setUpdatingId(bookingId);
    setError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/vendor/bookings/${bookingId}/reject`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess('Booking request declined and slot released.');
        await fetchDashboardData();
      } else {
        setError(data.error || 'Failed to decline booking request.');
      }
    } catch (err) {
      setError('Error declining session.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCompleteBooking = async (bookingId: string, actualDuration: number) => {
    setUpdatingId(bookingId);
    setError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/vendor/bookings/${bookingId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualDuration }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess('Booking marked as completed. Earnings and overtime calculated.');
        await fetchDashboardData();
      } else {
        setError(data.error || 'Failed to complete booking.');
      }
    } catch (err) {
      setError('Error completing session.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Filter inbox (incoming or active sessions) vs past (completed or cancelled)
  const activeInbox = bookings.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED');
  const pastSessions = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'CANCELLED');

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-tr from-[#5B8DEF]/5 via-[#FAF8F5] to-[#C5B3FF]/5 relative overflow-hidden">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8 space-y-8">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center border-b border-[#E5E1D8] pb-6">
            <div className="space-y-2">
              <div className="h-8 w-48 shimmer-skeleton"></div>
              <div className="h-4 w-64 shimmer-skeleton"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Inbox column skeleton */}
            <div className="lg:col-span-8 space-y-4">
              <div className="h-44 w-full shimmer-skeleton"></div>
              <div className="h-44 w-full shimmer-skeleton"></div>
            </div>
            
            {/* Earnings column skeleton */}
            <div className="lg:col-span-4 space-y-6">
              <div className="h-56 w-full shimmer-skeleton"></div>
              <div className="h-44 w-full shimmer-skeleton"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Account not approved view
  if (vendorProfile && vendorProfile.verificationStatus !== 'APPROVED') {
    const isKycDone = user?.kycStatus === 'PENDING' || user?.kycStatus === 'VERIFIED';
    const isBusinessDone = !!vendorProfile.businessLicenseNo;
    const isVehicleDone = vans.length > 0;
    const isInspectionDone = vans.length > 0 && !!vans[0].onSiteInspectionCertUrl && !!vans[0].fakePhotoDeclaration;

    const onboardingIncomplete = !isKycDone || !isBusinessDone || !isVehicleDone || !isInspectionDone;

    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-tr from-[#5B8DEF]/5 via-[#FAF8F5] to-[#C5B3FF]/5 relative overflow-hidden">
        <Navbar />
        <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-16 sm:px-6 z-10">
          <div className="glass-card text-center space-y-6 p-8 sm:p-12">
            
            {onboardingIncomplete ? (
              <>
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200">
                  <FileText className="w-12 h-12 animate-pulse" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-primary">Onboarding Checklist Incomplete</h1>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  Before our administrators can review and approve your account, you must complete the mandatory 4-step onboarding credentials setup.
                </p>
                
                <div className="bg-[#FCF9F6] border border-[#E5E1D8]/60 p-5 rounded-xl text-left max-w-md mx-auto text-xs space-y-3.5 shadow-sm">
                  <h4 className="font-bold text-primary border-b border-[#E5E1D8]/40 pb-1.5 uppercase tracking-wide">Pending Setup Phases</h4>
                  
                  {/* Step 1: KYC */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">1. Personal KYC Verification</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${isKycDone ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'}`}>
                      {isKycDone ? '✓ Completed' : 'Pending Upload'}
                    </span>
                  </div>

                  {/* Step 2: Business */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">2. Business Validation (GST/Bank/PAN)</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${isBusinessDone ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'}`}>
                      {isBusinessDone ? '✓ Completed' : 'Pending Info'}
                    </span>
                  </div>

                  {/* Step 3: Vehicle */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">3. Commercial Vehicle details (RC/Ins/PUC)</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${isVehicleDone ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'}`}>
                      {isVehicleDone ? '✓ Completed' : 'Pending Registration'}
                    </span>
                  </div>

                  {/* Step 4: Inspection */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">4. On-site Inspection Certificate</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${isInspectionDone ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'}`}>
                      {isInspectionDone ? '✓ Completed' : 'Pending Inspection'}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/vendor/onboarding"
                    className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-md text-white bg-secondary hover:bg-secondary/95 shadow transition-all cursor-pointer"
                  >
                    👉 Complete Onboarding Wizard Now
                  </Link>
                </div>
              </>
            ) : vendorProfile.verificationStatus === 'PENDING' ? (
              <>
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                  <Clock className="w-12 h-12" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-primary">Partner Vetting In Progress</h1>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  Thank you for registering with Nivara. Your business application for <span className="font-bold text-primary">{vendorProfile.businessName}</span> and banking logs are currently under administrative review.
                </p>
                <div className="bg-[#FCF9F6] border border-[#E5E1D8]/60 p-4 rounded-lg text-left max-w-md mx-auto text-xs space-y-2.5">
                  <h4 className="font-bold text-primary border-b border-[#E5E1D8]/40 pb-1.5 uppercase tracking-wide">Onboarding checklist</h4>
                  <div className="flex items-center gap-2 text-secondary font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Partner profile created
                  </div>
                  <div className="flex items-center gap-2 text-secondary font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Payment details submitted
                  </div>
                  <div className="flex items-center gap-2 text-amber-600 font-semibold animate-pulse">
                    <Clock className="w-4 h-4" /> Security Vetting (Admin Pending)
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" /> Portfolio Go-Live
                  </div>
                </div>
              </>
            ) : vendorProfile.verificationStatus === 'REJECTED' ? (
              <>
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-red-50 text-red-600 border border-red-200">
                  <AlertTriangle className="w-12 h-12" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-primary">Partner Application Rejected</h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Unfortunately, our administrators could not approve your application with the business documents provided.
                </p>
                {vendorProfile.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800 text-xs text-left max-w-md mx-auto">
                    <span className="font-bold">Rejection Reason:</span>
                    <p className="mt-1 leading-relaxed">{vendorProfile.rejectionReason}</p>
                  </div>
                )}
                <div className="pt-4">
                  <Link
                    href="/vendor/onboarding"
                    className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all"
                  >
                    Resubmit Partner Profile
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-red-100 text-red-600 border border-red-200">
                  <AlertTriangle className="w-12 h-12" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-primary">Account Suspended</h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Your host profile has been suspended due to policy violations. You cannot receive bookings or list vehicles. Contact partner support at host-relations@nivara.com.
                </p>
              </>
            )}

          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-tr from-[#5B8DEF]/5 via-[#FAF8F5] to-[#C5B3FF]/5 relative overflow-hidden">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 page-entrance">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E1D8] pb-6">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">{vendorProfile?.businessName}</h1>
              <p className="text-sm text-muted-foreground">Manage your cabins bookings inbox and review payouts ledger.</p>
            </div>
            
            <div className="flex gap-3">
              <Link
                href={`/vendor/portfolio/${vendorProfile?.id}`}
                className="inline-flex items-center justify-center px-4 py-2 border border-[#E5E1D8] bg-white text-primary text-sm font-semibold rounded-md hover:bg-gray-50 transition-all"
              >
                View Public Portfolio
              </Link>
              <Link
                href="/vendor/vans/new"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all"
              >
                Add Wellness Van
              </Link>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="flex gap-2.5 items-start p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <div>{error}</div>
            </div>
          )}
          {actionSuccess && (
            <div className="flex gap-2.5 items-start p-4 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />
              <div>{actionSuccess}</div>
            </div>
          )}

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left bookings inbox */}
            <div className="lg:col-span-8 space-y-6">
              <div className="glass-card space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#FAF8F5]">
                  <Inbox className="w-5 h-5 text-secondary" />
                  <h2 className="font-serif text-lg font-bold text-primary">Bookings Inbox</h2>
                </div>

                {activeInbox.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Inbox className="w-10 h-10 text-muted-foreground mx-auto" />
                    <h4 className="font-bold text-primary text-sm">Inbox is empty</h4>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      You do not have any incoming booking requests. Make sure your vans have open slots generated on the availability calendar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeInbox.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 border border-[#E5E1D8] rounded-lg space-y-3 bg-[#FCF9F6]/20 relative hover:border-[#D4A373]/40 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-bold">
                              {booking.van.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs font-bold text-primary">
                                Customer: {booking.customer.name}
                              </span>
                              {booking.customer.kycStatus === 'VERIFIED' && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-secondary/15 border border-secondary/20 text-secondary rounded text-[9px] font-bold uppercase tracking-wider">
                                  <ShieldCheck className="w-3 h-3" /> KYC Verified
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] bg-secondary/10 border border-secondary/20 text-secondary font-bold px-2 py-0.5 rounded uppercase">
                              {booking.status}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-mono block mt-1">
                              {booking.bookingCode}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-primary leading-relaxed border-t border-[#E5E1D8]/45 pt-3">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-semibold">
                              {formatDate(booking.availability.startTime)} @ {formatTime(booking.availability.startTime)} - {formatTime(booking.availability.endTime)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <span className="text-muted-foreground">Session Length: <span className="font-bold text-primary">{booking.sessionLength} min</span></span>
                            <span className="font-bold">₹{booking.payment?.amount || 0}</span>
                          </div>
                        </div>

                        {/* Customer Session Needs/Receipt details */}
                        <div className="bg-slate-50 border border-slate-200/60 p-3 rounded text-[11px] text-primary space-y-1.5 mt-2 font-sans">
                          <span className="font-bold text-secondary text-[10px] uppercase tracking-wider block">Customer Session Needs</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div><span className="text-muted-foreground block text-[9px] uppercase">Aroma Diffuser</span><span className="font-semibold">{booking.scent}</span></div>
                            <div><span className="text-muted-foreground block text-[9px] uppercase">Ambient Light</span><span className="font-semibold">{booking.lighting}</span></div>
                            <div><span className="text-muted-foreground block text-[9px] uppercase">Soundscape</span><span className="font-semibold">{booking.audio}</span></div>
                          </div>
                          <div className="border-t border-slate-200/40 pt-1.5 flex flex-wrap justify-between gap-2">
                            <span>Service Delivery: <span className="font-bold">{booking.serviceModel === 'PICK_AND_DROP' ? '🚗 Pick & Drop' : '📍 Steady Station'}</span></span>
                            {booking.serviceModel === 'PICK_AND_DROP' && (
                              <div className="w-full text-[10px] bg-white p-2 rounded border border-slate-200 mt-1 space-y-0.5 font-sans">
                                <p><span className="font-semibold text-slate-500">Pick-up:</span> {booking.pickupAddress}</p>
                                <p><span className="font-semibold text-slate-500">Drop-off:</span> {booking.dropoffAddress}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          {booking.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleConfirmBooking(booking.id)}
                                disabled={updatingId === booking.id}
                                className="flex-grow py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                              >
                                Accept Booking
                              </button>
                              <button
                                onClick={() => handleRejectBooking(booking.id)}
                                disabled={updatingId === booking.id}
                                className="flex-grow py-2 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                              >
                                Decline Request
                              </button>
                            </>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => {
                                  setCompletingBookingId(booking.id);
                                  setActualDurationInput(booking.sessionLength);
                                }}
                                disabled={updatingId === booking.id}
                                className="flex-grow py-2 bg-secondary hover:bg-secondary/95 text-primary-foreground font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                              >
                                Mark Session Complete
                              </button>
                              <button
                                onClick={() => handleRejectBooking(booking.id)}
                                disabled={updatingId === booking.id}
                                className="py-2 px-3 border border-red-200 hover:bg-red-50 text-red-650 rounded text-xs transition-colors"
                                title="Cancel Active Booking"
                              >
                                Cancel Session
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Collapsible Past Bookings logs */}
              <div className="glass-card space-y-4">
                <button
                  onClick={() => setShowPastSessions(!showPastSessions)}
                  className="w-full flex justify-between items-center text-primary font-bold"
                >
                  <span className="font-serif text-base flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-muted-foreground" />
                    Past Sessions Log ({pastSessions.length})
                  </span>
                  {showPastSessions ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>

                {showPastSessions && (
                  <div className="space-y-3 pt-3 border-t border-[#FAF8F5]">
                    {pastSessions.length === 0 ? (
                      <p className="text-center py-4 text-xs text-muted-foreground">No completed bookings logs found.</p>
                    ) : (
                      pastSessions.map((b) => (
                        <div key={b.id} className="flex justify-between items-center text-xs p-3 border border-[#E5E1D8]/60 bg-[#FCF9F6]/20 rounded-md">
                          <div>
                            <span className="font-bold block text-primary">{b.van.title}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">
                              Customer: {b.customer.name} | Date: {formatDate(b.availability.startTime)}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' : 'bg-red-50 text-red-600'
                            }`}>
                              {b.status}
                            </span>
                            <span className="font-semibold block text-primary mt-1">₹{b.payment?.amount || 0}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right earnings details */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Earnings Overview */}
              <div className="glass-card space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-[#FAF8F5]">
                  <BarChart3 className="w-5 h-5 text-[#2C5234]" />
                  <h2 className="font-serif text-lg font-bold text-primary">Financial Summary (80% Share)</h2>
                </div>

                <div className="space-y-6">
                  {/* Main Vendor Earnings */}
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-bold">Your Total Earnings (80%)</span>
                    <span className="text-3xl font-serif font-bold text-[#2C5234] mt-1 block">
                      ₹{(earnings?.vendorEarnings || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-1">From total gross bookings of ₹{(earnings?.totalEarnings || 0).toLocaleString('en-IN')}</span>
                  </div>

                  {/* Revenue Splits by Timeframe */}
                  <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">Today</span>
                      <span className="text-xs font-bold text-slate-900 mt-1 block">₹{((earnings?.todayRevenue || 0) * 0.8).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">Weekly</span>
                      <span className="text-xs font-bold text-slate-900 mt-1 block">₹{((earnings?.weeklyRevenue || 0) * 0.8).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">Monthly</span>
                      <span className="text-xs font-bold text-slate-900 mt-1 block">₹{((earnings?.monthlyRevenue || 0) * 0.8).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Average and count stats */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">Total Bookings</span>
                      <span className="text-sm font-serif font-extrabold text-primary mt-1 block">{earnings?.totalBookings || 0}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">Average Booking</span>
                      <span className="text-sm font-serif font-extrabold text-primary mt-1 block">₹{Math.round(earnings?.averageBookingValue || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">Completed</span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5 block">{earnings?.completedSessionsCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">Utilization</span>
                      <span className="text-xs font-bold text-secondary mt-0.5 block">
                        {earnings?.utilizationRate || 0}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">Rating</span>
                      <span className="text-xs font-bold text-[#D4A373] mt-0.5 block">
                        {vendorProfile?.ratingAvg ? vendorProfile.ratingAvg.toFixed(1) : '5.0'} ★
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout banking info card */}
              <div className="glass-card space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#FAF8F5]">
                  <CreditCard className="w-5 h-5 text-secondary" />
                  <h3 className="font-serif text-base font-bold text-primary">Payout Account</h3>
                </div>

                <div className="bg-[#FCF9F6] border border-[#E5E1D8]/60 p-3.5 rounded text-xs space-y-1">
                  <span className="text-muted-foreground block">Linked Payout Destination:</span>
                  <p className="font-bold text-primary leading-normal">{earnings.payoutDetails || 'No details linked.'}</p>
                </div>
                
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Payments are credited directly to your bank account weekly on Tuesdays after session verification completes.
                </p>
              </div>

              {/* Revenue Projector Card */}
              <div className="glass-card space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-[#FAF8F5]">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="font-serif text-base font-bold text-primary">Revenue Projector</h3>
                </div>

                <p className="text-[10px] text-muted-foreground leading-normal">
                  Estimate expansion earnings using your active fleet utilization rate (**{earnings.utilizationRate || 35}%**) as the baseline.
                </p>

                <div className="space-y-4">
                  {/* Slider 1: Active Vans */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Vans in Operation</span>
                      <span className="font-bold text-primary">{projectedVans} Van(s)</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={projectedVans}
                      onChange={(e) => setProjectedVans(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Slider 2: Average Booking Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Average Hourly Rate</span>
                      <span className="font-bold text-primary">₹{projectedRate} / hr</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={2000}
                      step={50}
                      value={projectedRate}
                      onChange={(e) => setProjectedRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Slider 3: Daily Active Hours */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Daily Service Hours</span>
                      <span className="font-bold text-primary">{projectedHours} hrs</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={projectedHours}
                      onChange={(e) => setProjectedHours(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Calculation Display */}
                  <div className="bg-[#FCF9F6] p-4 rounded-xl border border-[#E5E1D8]/60 text-center space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Projected Monthly Revenue</span>
                    <span className="text-2xl font-serif font-black text-secondary block">
                      ₹{Math.round(projectedVans * projectedRate * projectedHours * ((earnings.utilizationRate || 35) / 100) * 30).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium block">calculated at {earnings.utilizationRate || 35}% base utilization</span>
                  </div>
                </div>
              </div>

              {/* Nivara GPS Flightdeck (Real-time Coordinate Tracking Simulator) */}
              <div className="glass-card space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#FAF8F5]">
                  <Compass className="w-5 h-5 text-secondary" />
                  <h3 className="font-serif text-base font-bold text-primary">GPS Flightdeck</h3>
                </div>

                <p className="text-[10px] text-muted-foreground leading-normal">
                  Manage dynamic vehicle coordinates and simulate travel routing in active regions.
                </p>

                {vans.length === 0 ? (
                  <p className="text-center py-2 text-xs text-muted-foreground">No wellness pods listed.</p>
                ) : (
                  <div className="space-y-3">
                    {vans.map((van) => (
                      <div
                        key={van.id}
                        className="bg-[#FCF9F6] border border-[#E5E1D8]/60 p-3 rounded-lg text-xs space-y-2 text-primary"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold truncate max-w-[150px]">{van.title}</span>
                          {van.currentLatitude ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                              Simulating
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-bold">
                              Stationary
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-muted-foreground space-y-0.5">
                          <p>
                            <span className="font-medium text-primary">Base Pos:</span> {van.latitude.toFixed(4)}, {van.longitude.toFixed(4)}
                          </p>
                          {van.currentLatitude && (
                            <p className="text-[#2C5234] font-medium flex items-center gap-1">
                              <Navigation className="w-3 h-3 text-[#2C5234]" />
                              <span>Live GPS: {van.currentLatitude.toFixed(4)}, {van.currentLongitude.toFixed(4)}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-[#E5E1D8]/40">
                          {van.currentLatitude ? (
                            <button
                              type="button"
                              onClick={() => stopGpsSimulation(van.id)}
                              className="flex-grow py-1.5 bg-white border border-[#E5E1D8] text-red-600 rounded text-[10px] font-bold hover:bg-red-50 transition-all cursor-pointer"
                            >
                              Reset Coordinates
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startGpsSimulation(van.id)}
                              className="flex-grow py-1.5 bg-primary text-white rounded text-[10px] font-bold hover:bg-primary/95 shadow transition-all cursor-pointer"
                            >
                              Simulate Live GPS
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Embedded GPS Tracking Map / Visual Radar Display */}
                <div className="w-full h-52 rounded-xl border border-[#E5E1D8] overflow-hidden mt-3 relative bg-[#EAE6DF] shadow-inner">
                  {isLoaded && hasRealKey ? (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      zoom={11}
                      center={
                        vans.find(v => v.currentLatitude) 
                          ? { lat: vans.find(v => v.currentLatitude).currentLatitude, lng: vans.find(v => v.currentLatitude).currentLongitude }
                          : (vans[0] ? { lat: vans[0].latitude, lng: vans[0].longitude } : { lat: 19.0760, lng: 72.8777 })
                      }
                      options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                      }}
                    >
                      {vans.map((van) => (
                        <Marker
                          key={van.id}
                          position={{
                            lat: van.currentLatitude || van.latitude,
                            lng: van.currentLongitude || van.longitude,
                          }}
                          title={van.title}
                        />
                      ))}
                    </GoogleMap>
                  ) : (
                    // Premium Mock Map Visualizer with localized CSS animation
                    <div className="absolute inset-0 bg-[#EAE6DF] flex flex-col justify-between p-3 font-mono text-[9px] text-slate-700 select-none overflow-hidden">
                      <style>{`
                        @keyframes scan {
                          0% { transform: translateY(-50px); opacity: 0; }
                          50% { opacity: 0.6; }
                          100% { transform: translateY(150px); opacity: 0; }
                        }
                        .animate-scan {
                          animation: scan 4s linear infinite;
                        }
                      `}</style>
                      
                      {/* Radar sweep line */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(44,82,52,0.08)_0%,transparent_75%)] animate-pulse"></div>
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#2C5234]/20 animate-scan"></div>
                      
                      <div className="flex justify-between items-start z-10">
                        <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[8px] tracking-widest uppercase animate-pulse font-bold">
                          📡 GPS Tracking Live Feed
                        </span>
                        <span className="text-[8px] text-slate-500 font-bold">SECTOR: MUMBAI-THANE</span>
                      </div>

                      {/* Dot markers rendering over relative map screen grid */}
                      <div className="relative flex-grow flex items-center justify-center">
                        {vans.map((van, idx) => {
                          const isSim = !!van.currentLatitude;
                          const lat = van.currentLatitude || van.latitude;
                          const lng = van.currentLongitude || van.longitude;
                          // Distribute markers visually on radar
                          const leftOffset = 25 + (idx * 30);
                          const topOffset = 35 + (idx * 20);
                          return (
                            <div 
                              key={van.id}
                              style={{ left: `${leftOffset}%`, top: `${topOffset}%` }}
                              className="absolute flex items-center gap-1.5 transition-all duration-1000"
                            >
                              <div className="relative">
                                <span className={`absolute -inset-2.5 rounded-full ${isSim ? 'bg-amber-500/30 animate-ping' : 'bg-[#2C5234]/15'}`}></span>
                                <span className={`w-2.5 h-2.5 rounded-full border border-white shadow block ${isSim ? 'bg-amber-500 animate-pulse' : 'bg-secondary'}`}></span>
                              </div>
                              <span className="bg-white/90 px-1 py-0.5 rounded border border-slate-300 text-[8px] font-bold text-primary max-w-[80px] truncate shadow-sm">
                                {van.title.split(' ')[0]} {isSim ? '🚀' : '📍'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-end z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded border border-[#E5E1D8]/60 text-[8px]">
                        <div>
                          <span className="font-bold text-primary uppercase block">Telemetry Stream:</span>
                          <span className="text-slate-600 font-medium">
                            {vans.filter(v => v.currentLatitude).length} Simulating | {vans.filter(v => !v.currentLatitude).length} Stationary
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 font-bold">COORDS SYNC: OK</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      {completingBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E1D8] p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-xl text-primary">
            <h3 className="font-serif text-lg font-bold">Log Session Completion</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Please enter the actual duration (in minutes) spent by the customer inside the wellness cabin.
            </p>
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Actual Duration (Minutes)</span>
              <input
                type="number"
                min="1"
                className="w-full p-2 border border-[#E5E1D8] rounded text-sm text-primary font-medium focus:outline-none focus:border-secondary bg-white"
                value={actualDurationInput}
                onChange={(e) => setActualDurationInput(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  handleCompleteBooking(completingBookingId, actualDurationInput);
                  setCompletingBookingId(null);
                }}
                disabled={updatingId !== null}
                className="flex-grow py-2.5 bg-primary hover:bg-primary/95 text-white rounded text-xs font-semibold shadow transition-all cursor-pointer disabled:opacity-50"
              >
                Submit & Complete
              </button>
              <button
                onClick={() => setCompletingBookingId(null)}
                className="flex-grow py-2.5 bg-white border border-[#E5E1D8] text-primary rounded text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 10-Minute Turnaround Warning Popup for Vendor */}
      {sessionEndingAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-4 flex gap-3 animate-slide-up">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0 animate-pulse">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-grow space-y-1">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 animate-pulse">
                Session Ending Soon
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">
                {Math.floor(sessionEndingAlert.remainingSeconds / 60)}m {sessionEndingAlert.remainingSeconds % 60}s left
              </span>
            </div>
            <h4 className="font-serif text-sm font-bold text-slate-100 leading-snug">
              {sessionEndingAlert.booking.van.title}
            </h4>
            <p className="text-[11px] text-slate-400">
              Customer <span className="font-semibold text-slate-200">{sessionEndingAlert.booking.customer.name}</span>'s session is concluding. Prepare the 15-minute turnaround cleaning buffer!
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
