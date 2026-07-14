'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, Clock, MapPin, Receipt, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: string;
  bookingCode: string;
  sessionLength: number;
  serviceModel: string;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  includeParkingFee: boolean;
  parkingFeeAmount: number;
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
    currency: string;
  } | null;
}

export default function BookingCheckout({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const router = useRouter();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const res = await fetch(`/api/customer/bookings/${bookingId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setBooking(data.booking);
        } else {
          setError(data.error || 'Failed to retrieve booking information.');
        }
      } catch (err) {
        setError('Error loading checkout session.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handlePayment = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/customer/bookings/${bookingId}/pay`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.url) {
        // Redirect directly to the checkout URL (Stripe or Mock Checkout Page)
        router.push(data.url);
      } else {
        setError(data.error || 'Failed to initiate payment transaction.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An error occurred during checkout.');
      setIsSubmitting(false);
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

  if (error || !booking) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <div className="flex-grow max-w-3xl mx-auto w-full px-4 py-16 text-center space-y-4">
          <h1 className="font-serif text-2xl font-bold text-primary">Checkout Error</h1>
          <p className="text-sm text-muted-foreground">{error || 'Session not found.'}</p>
          <div className="pt-2">
            <Link href="/customer/search" className="text-secondary font-semibold hover:underline">
              Back to search
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

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 bg-white p-6 sm:p-8 rounded-xl border border-[#E5E1D8] shadow-md">
          
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-primary">Confirm & Pay</h1>
            <p className="text-xs text-muted-foreground mt-1">Please review your cabin slot selection details.</p>
          </div>

          {/* Details Summary Card */}
          <div className="border-b border-[#FAF8F5] pb-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-primary">{booking.van.title}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4.5 h-4.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <span className="leading-relaxed text-muted-foreground block">{booking.van.address}</span>
                  <span className="inline-block bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold">
                    Mode: {booking.serviceModel === 'PICK_AND_DROP' ? '🚗 Pick & Drop' : '📍 Steady Station'}
                  </span>
                  {booking.serviceModel === 'PICK_AND_DROP' && (
                    <div className="text-[10px] text-slate-500 space-y-0.5 pt-1.5 border-t border-[#FAF8F5]">
                      <p><span className="font-bold">Pick-up:</span> {booking.pickupAddress}</p>
                      <p><span className="font-bold">Drop-off:</span> {booking.dropoffAddress}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(booking.availability.startTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold">
                    {formatTime(booking.availability.startTime)} - {formatTime(booking.availability.endTime)}
                    <span className="font-normal text-muted-foreground ml-1">({booking.sessionLength} Min)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Details breakdown */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-primary">Fare Summary</h4>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wellness Pod Rental ({booking.sessionLength} Min)</span>
                <span>₹{(booking.payment?.amount || 0) - (booking.includeParkingFee ? booking.parkingFeeAmount : 0)}</span>
              </div>
              {booking.includeParkingFee && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dedicated Parking Spot Reservation fee</span>
                  <span>₹{booking.parkingFeeAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cabin Sanitization Service fee</span>
                <span className="text-secondary font-medium">Free</span>
              </div>
              <div className="flex justify-between border-t border-[#FAF8F5] pt-3 text-sm font-bold text-primary">
                <span>Total Amount Due</span>
                <span>₹{booking.payment?.amount || 0}</span>
              </div>
            </div>
          </div>

          {/* Security details badge */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs flex gap-2.5 items-start">
            <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-primary">Beta Pilot Checkout (Simulated)</span>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                Nivara is currently running in test pilot mode. Payments are simulated and no real credit card numbers or money transactions are processed.
              </p>
            </div>
          </div>

          {/* Submit / Cancel Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handlePayment}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all disabled:opacity-55 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Securely Loading...
                </>
              ) : (
                <>
                  Proceed to Payment <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            <Link
              href="/customer/search"
              className="inline-flex items-center justify-center py-3 px-4 border border-[#E5E1D8] text-primary rounded-md text-sm hover:bg-gray-50 transition-all font-semibold"
            >
              Cancel Selection
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
