'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MapPin, Star, Sparkles, Calendar, Clock, AlertTriangle, ShieldCheck, User, CheckCircle2 } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer: {
    name: string;
  };
}

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
}

interface Van {
  id: string;
  title: string;
  description: string;
  address: string;
  price15: number;
  price30: number;
  price45: number;
  amenities: string[];
  photos: string[];
  hasAttendant: boolean;
  attendantName: string | null;
  vendor: {
    id: string;
    businessName: string;
    bio: string;
    ratingAvg: number;
    verificationStatus: string;
  };
  reviews: Review[];
}

export default function VanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [van, setVan] = useState<Van | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selector states
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [sessionLength, setSessionLength] = useState<30 | 45 | 60>(30);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialSlotPopulated, setInitialSlotPopulated] = useState(false);

  // Service options
  const [serviceModel, setServiceModel] = useState<'STEADY' | 'PICK_AND_DROP'>('STEADY');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [includeParkingFee, setIncludeParkingFee] = useState(false);

  // Sensory Customizer Preset State
  const [scent, setScent] = useState('Lavender');
  const [lighting, setLighting] = useState('Sunset Copper');
  const [audio, setAudio] = useState('Binaural Beats');

  // Hydrate preset from landing page local cache on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nivara_calm_preset');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.scent) setScent(parsed.scent);
          if (parsed.lighting) setLighting(parsed.lighting);
          if (parsed.audio) setAudio(parsed.audio);
        } catch (e) {
          console.error('Error parsing cached presets:', e);
        }
      }
    }
  }, []);

  // Hydrate initial selection from URL query parameters (e.g. from chatbot link) or fallback to today
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlDate = params.get('date');
      const urlSlotId = params.get('slotId');
      const urlLength = params.get('sessionLength');

      if (urlDate) {
        setSelectedDate(urlDate);
      } else {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
      }

      if (urlSlotId) {
        setSelectedSlotId(urlSlotId);
      }

      if (urlLength) {
        const len = parseInt(urlLength);
        if (len === 30 || len === 45 || len === 60) {
          setSessionLength(len as 30 | 45 | 60);
        }
      }
    }
  }, []);

  const fetchVanDetails = async () => {
    try {
      const res = await fetch(`/api/customer/vans/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setVan(data.van);
      } else {
        setError(data.error || 'Van details not found.');
      }
    } catch (e) {
      setError('An error occurred loading details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date: string) => {
    if (!date) return;
    setSlotsLoading(true);
    try {
      const res = await fetch(`/api/customer/vans/${id}/slots?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (e) {
      console.error('Error fetching slots:', e);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    fetchVanDetails();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
      if (initialSlotPopulated) {
        setSelectedSlotId(null);
      } else {
        setInitialSlotPopulated(true);
      }
    }
  }, [selectedDate, id]);

  const handleBookSlot = async () => {
    if (!user) {
      router.push(`/login?redirect=/customer/vans/${id}`);
      return;
    }

    /*
    if (user.kycStatus !== 'VERIFIED') {
      setBookingError('Booking blocked: Your identity verification (KYC) is required first.');
      return;
    }
    */

    if (!selectedSlotId) {
      setBookingError('Please select a relaxation slot from the calendar.');
      return;
    }

    if (serviceModel === 'PICK_AND_DROP' && (!pickupAddress.trim() || !dropoffAddress.trim())) {
      setBookingError('Please enter both pick-up and drop-off locations.');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/customer/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vanId: id,
          slotId: selectedSlotId,
          sessionLength,
          scent,
          lighting,
          audio,
          serviceModel,
          pickupAddress: serviceModel === 'PICK_AND_DROP' ? pickupAddress : undefined,
          dropoffAddress: serviceModel === 'PICK_AND_DROP' ? dropoffAddress : undefined,
          includeParkingFee,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push(`/customer/bookings/${data.bookingId}/checkout`);
      } else {
        setBookingError(data.error || 'Failed to book slot.');
      }
    } catch (err: any) {
      setBookingError('An error occurred while creating booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= floor ? 'text-[#D4A373] fill-[#D4A373]' : 'text-gray-200'
          }`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !van) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <div className="flex-grow max-w-3xl mx-auto w-full px-4 py-16 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="font-serif text-2xl font-bold text-primary">Error Loading Pod Details</h1>
          <p className="text-sm text-muted-foreground">{error || 'Wellness van listing not found.'}</p>
          <div className="pt-2">
            <Link href="/customer/search" className="text-secondary font-semibold hover:underline">
              Back to Discover
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Main Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Visual Header / Photo Grid */}
            <div className="relative w-full h-64 sm:h-80 rounded-xl bg-gradient-to-br from-[#2C5234]/15 to-[#0A2540]/10 border border-[#E5E1D8] flex items-center justify-center shadow-sm overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#C19A6B_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
              <div className="text-center space-y-2 z-10">
                <Sparkles className="w-10 h-10 text-secondary mx-auto" />
                <h3 className="font-serif text-lg font-bold text-primary">Nivara Wellness Pod Interior</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Warm Timber Amber lighting setting</p>
              </div>
            </div>

            {/* Title & Info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-3xl font-bold tracking-tight text-primary leading-tight">
                  {van.title}
                </h1>
                <span className="bg-secondary/15 text-secondary border border-secondary/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
                  Active Sanctuary
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground leading-normal">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>{van.address}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-[#E5E1D8] p-6 rounded-xl space-y-3 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-primary">About the Pod Cabin</h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans font-light">
                {van.description}
              </p>
            </div>

            {/* Amenities Chips */}
            <div className="bg-white border border-[#E5E1D8] p-6 rounded-xl space-y-4 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-primary">Cabin Amenities</h2>
              <div className="flex flex-wrap gap-2.5">
                {(() => {
                  const basicList = ['Zero-Gravity Chair', 'Soundproofing', 'Calming Audio'];
                  const intermediateList = ['Zero-Gravity Chair', 'Soundproofing', 'Calming Audio', 'Aromatherapy', 'Ambient Lighting'];
                  let displayedAmenities = van.amenities;
                  if (sessionLength === 30) {
                    displayedAmenities = van.amenities.filter(a => basicList.some(item => a.toLowerCase().includes(item.toLowerCase())));
                    if (displayedAmenities.length === 0) displayedAmenities = van.amenities.slice(0, 3);
                  } else if (sessionLength === 45) {
                    displayedAmenities = van.amenities.filter(a => intermediateList.some(item => a.toLowerCase().includes(item.toLowerCase())));
                    if (displayedAmenities.length === 0) displayedAmenities = van.amenities.slice(0, 5);
                  }
                  return displayedAmenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-[#FCF9F6] border border-[#E5E1D8] text-xs font-semibold text-primary px-3 py-1.5 rounded-md transition-all duration-300 animate-in fade-in"
                    >
                      {amenity}
                    </span>
                  ));
                })()}
              </div>
            </div>

            {/* Vendor Profile Snippet */}
            <div className="bg-white border border-[#E5E1D8] p-6 rounded-xl space-y-4 shadow-sm">
              <div className="flex justify-between items-start border-b border-[#FAF8F5] pb-4">
                <div>
                  <h3 className="font-serif text-base font-bold text-primary">Vetted Host Profile</h3>
                  <Link href={`/vendor/portfolio/${van.vendor.id}`} className="text-xs text-secondary font-semibold hover:underline mt-0.5 block">
                    {van.vendor.businessName}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary/15 text-secondary border border-secondary/20 text-[10px] font-bold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" /> Approved Partner
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-light">
                {van.vendor.bio}
              </p>
            </div>
          </div>

          {/* Right Live Slot Picker (Sticky Widget) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-[#E5E1D8] rounded-xl p-6 shadow-md space-y-6">
              
              <div>
                <h3 className="font-serif text-xl font-bold text-primary">Book Recovery Session</h3>
                <p className="text-[10px] text-muted-foreground mt-1">Select your duration and preferred time slot.</p>
              </div>

              {/* Booking status error */}
              {bookingError && (
                <div className="flex gap-2 items-start p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <div>
                    {bookingError === 'KYC_NOT_VERIFIED' || bookingError.includes('KYC') ? (
                      <span>
                        Identity Verification Required. Complete your documents at{' '}
                        <Link href="/customer/kyc" className="underline font-bold text-primary">
                          KYC verification page
                        </Link>{' '}
                        to continue.
                      </span>
                    ) : (
                      <span>{bookingError}</span>
                    )}
                  </div>
                </div>
              )}



              {/* Duration selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Session Duration
                </label>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <button
                    onClick={() => setSessionLength(30)}
                    className={`py-2 px-1 border rounded-md font-bold transition-all cursor-pointer ${
                      sessionLength === 30
                        ? 'border-secondary bg-[#FCF9F6] text-secondary ring-1 ring-secondary'
                        : 'border-[#E5E1D8] text-muted-foreground hover:text-primary bg-white'
                    }`}
                  >
                    30 Min
                    <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">₹{van.price15}</span>
                  </button>
                  <button
                    onClick={() => setSessionLength(45)}
                    className={`py-2 px-1 border rounded-md font-bold transition-all cursor-pointer ${
                      sessionLength === 45
                        ? 'border-secondary bg-[#FCF9F6] text-secondary ring-1 ring-secondary'
                        : 'border-[#E5E1D8] text-muted-foreground hover:text-primary bg-white'
                    }`}
                  >
                    45 Min
                    <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">₹{van.price30}</span>
                  </button>
                  <button
                    onClick={() => setSessionLength(60)}
                    className={`py-2 px-1 border rounded-md font-bold transition-all cursor-pointer ${
                      sessionLength === 60
                        ? 'border-secondary bg-[#FCF9F6] text-secondary ring-1 ring-secondary'
                        : 'border-[#E5E1D8] text-muted-foreground hover:text-primary bg-white'
                    }`}
                  >
                    60 Min
                    <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">₹{van.price45}</span>
                  </button>
                </div>
              </div>

              {/* Sensory Customizer Preset Selectors inside the booking card */}
              <div className="space-y-3 pt-3 border-t border-[#E5E1D8]/50">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sensory Presets
                </label>
                
                {/* Scent selector */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">Aromatherapy Diffuser</span>
                  <select 
                    value={scent}
                    onChange={(e) => setScent(e.target.value)}
                    className="w-full p-2 border border-[#E5E1D8] rounded bg-white text-xs text-primary font-medium focus:outline-none"
                  >
                    <option value="Lavender">Lavender (Deep Relaxation)</option>
                    <option value="Eucalyptus">Eucalyptus (Mental Focus)</option>
                    <option value="Citrus">Citrus (Mood Energizer)</option>
                  </select>
                </div>

                {/* Lighting selector */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">Cabin Ambient Lighting</span>
                  <select 
                    value={lighting}
                    onChange={(e) => setLighting(e.target.value)}
                    className="w-full p-2 border border-[#E5E1D8] rounded bg-white text-xs text-primary font-medium focus:outline-none"
                  >
                    <option value="Sunset Copper">Sunset Copper (Warm Glow)</option>
                    <option value="Ocean Deep">Ocean Deep (Indigo Calm)</option>
                    <option value="Forest Neon">Forest Neon (Green Energy)</option>
                  </select>
                </div>

                {/* Audio selector */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">Acoustic Soundscapes</span>
                  <select 
                    value={audio}
                    onChange={(e) => setAudio(e.target.value)}
                    className="w-full p-2 border border-[#E5E1D8] rounded bg-white text-xs text-primary font-medium focus:outline-none"
                  >
                    <option value="Binaural Beats">Binaural Beats (Theta Sync)</option>
                    <option value="Rain Over Cabin">Rain Over Cabin (Pink Noise)</option>
                    <option value="Guided Decompression">Guided Decompression (Mindfulness)</option>
                  </select>
                </div>
              </div>

              {/* Service Model Selector */}
              <div className="space-y-3 pt-3 border-t border-[#E5E1D8]/50">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Service Delivery Model
                </label>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => setServiceModel('STEADY')}
                    className={`py-2.5 px-1.5 border rounded-md font-bold transition-all ${
                      serviceModel === 'STEADY'
                        ? 'border-secondary bg-[#FCF9F6] text-secondary ring-1 ring-secondary'
                        : 'border-[#E5E1D8] text-muted-foreground bg-white'
                    }`}
                  >
                    Steady Position
                    <span className="block text-[9px] font-normal text-muted-foreground mt-0.5">Walk in at station</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceModel('PICK_AND_DROP')}
                    className={`py-2.5 px-1.5 border rounded-md font-bold transition-all ${
                      serviceModel === 'PICK_AND_DROP'
                        ? 'border-secondary bg-[#FCF9F6] text-secondary ring-1 ring-secondary'
                        : 'border-[#E5E1D8] text-muted-foreground bg-white'
                    }`}
                  >
                    Pick & Drop (Ola/Uber)
                    <span className="block text-[9px] font-normal text-muted-foreground mt-0.5">We come to you</span>
                  </button>
                </div>

                {serviceModel === 'PICK_AND_DROP' && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">Pick-up Location</span>
                      <input
                        type="text"
                        placeholder="Enter pick-up address..."
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        className="w-full p-2 border border-[#E5E1D8] rounded text-xs text-primary font-medium focus:outline-none focus:border-secondary"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">Drop-off Location</span>
                      <input
                        type="text"
                        placeholder="Enter drop-off address..."
                        value={dropoffAddress}
                        onChange={(e) => setDropoffAddress(e.target.value)}
                        className="w-full p-2 border border-[#E5E1D8] rounded text-xs text-primary font-medium focus:outline-none focus:border-secondary"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Parking Spot Selection */}
              <div className="space-y-2 pt-3 border-t border-[#E5E1D8]/50">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeParkingFee}
                    onChange={(e) => setIncludeParkingFee(e.target.checked)}
                    className="rounded border-[#E5E1D8] text-primary focus:ring-secondary w-4 h-4 mt-0.5"
                  />
                  <div className="text-xs text-primary leading-normal">
                    <span className="font-semibold block text-slate-800">Include Dedicated Parking Spot?</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Some prime spaces include a flat ₹150 parking fee.</span>
                  </div>
                </label>
              </div>

              {/* Date selection picker */}
              <div className="space-y-2 pt-3 border-t border-[#E5E1D8]/50">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#E5E1D8] rounded-md text-xs focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary bg-white text-primary font-medium"
                  />
                </div>
              </div>

              {/* Availability time blocks */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Available Time Slots
                </label>

                {slotsLoading ? (
                  <div className="flex justify-center py-4">
                    <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-[#E5E1D8] rounded bg-[#FCF9F6]/20">
                    No open slots found on this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`py-2 px-1 border rounded font-semibold transition-all ${
                          selectedSlotId === slot.id
                            ? 'bg-primary text-primary-foreground border-primary shadow'
                            : 'bg-white border-[#E5E1D8] text-primary hover:border-secondary'
                        }`}
                      >
                        <Clock className="w-3 h-3 inline mr-1 text-muted-foreground" />
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Attendant Info */}
              {van.hasAttendant && (
                <div className="p-3 bg-[#FCF9F6] border border-[#E5E1D8] rounded text-xs flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-primary">Dedicated Attendant Present</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Attendant {van.attendantName} will configure Diffuser Aromatics and Chair Position.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                onClick={handleBookSlot}
                disabled={isSubmitting || slotsLoading || !selectedSlotId}
                className="w-full py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Securing Slot...' : 'Reserve Session'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16 bg-white border border-[#E5E1D8] rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-primary mb-6">Visitor Experiences</h2>
          
          {van.reviews.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground leading-relaxed">
              No reviews have been written for this wellness pod yet. Be the first to share your experience after booking!
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-[#FAF8F5]">
              {van.reviews.map((review, i) => (
                <div key={review.id} className={`space-y-2 ${i > 0 ? 'pt-6' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FCF9F6] border border-[#E5E1D8] flex items-center justify-center text-xs font-semibold text-primary">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-primary">{review.customer.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-1">{renderStars(review.rating)}</div>

                  <p className="text-xs text-muted-foreground leading-relaxed italic font-light">
                    &quot;{review.comment}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
