'use client';

import React, { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CheckCircle2, Calendar, Clock, MapPin, QrCode, Navigation } from 'lucide-react';

interface Booking {
  id: string;
  bookingCode: string;
  sessionLength: number;
  van: {
    title: string;
    address: string;
    hasAttendant: boolean;
    attendantName: string | null;
    latitude: number;
    longitude: number;
    currentLatitude?: number | null;
    currentLongitude?: number | null;
    photos: string[];
  };
  availability: {
    startTime: string;
    endTime: string;
  };
  payment: {
    amount: number;
  } | null;
}

export default function BookingConfirmation({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/customer/bookings/${bookingId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setBooking(data.booking);
        } else {
          setError(data.error || 'Failed to fetch confirmation details.');
        }
      } catch (err) {
        setError('An error occurred loading confirmation.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

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
          <h1 className="font-serif text-2xl font-bold text-primary font-serif">Confirmation Error</h1>
          <p className="text-sm text-muted-foreground">{error || 'Session confirmation not found.'}</p>
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

      <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-12 sm:px-6">
        <div className="bg-white rounded-2xl border border-[#E5E1D8] shadow-lg p-6 sm:p-10 space-y-8 text-center relative overflow-hidden">
          
          {/* Header checkmark */}
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-secondary/15 text-secondary">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-primary">Booking Confirmed!</h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Your recovery pod slot has been locked successfully. Show your entry ticket code to the attendant upon arrival.
            </p>
          </div>

          {/* Ticket Ticket Design */}
          <div className="border-2 border-dashed border-[#D4A373] bg-[#FCF9F6]/40 p-6 rounded-xl space-y-5 text-left relative">
            <div className="flex flex-col sm:flex-row gap-4 items-start border-b border-[#E5E1D8]/40 pb-4">
              <div className="w-full sm:w-28 h-16 rounded-lg overflow-hidden border border-[#E5E1D8]/40 flex-shrink-0 relative">
                <img
                  src={(booking.van.photos && booking.van.photos.length > 0 && !booking.van.photos[0].startsWith('/images/')) ? booking.van.photos[0] : "/van_demo.jpg"}
                  alt={booking.van.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-bold">Wellness Pod</span>
                <h3 className="font-serif text-lg font-bold text-primary">{booking.van.title}</h3>
              </div>
              <div className="text-right sm:text-right w-full sm:w-auto">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-bold">Total Paid</span>
                <span className="font-bold text-primary text-base">₹{booking.payment?.amount || 0}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-primary leading-relaxed">
              <div className="flex gap-2 items-start">
                <MapPin className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{booking.van.address}</span>
              </div>

              <div className="space-y-1.5 sm:pl-4 sm:border-l border-[#E5E1D8]/40">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{formatDate(booking.availability.startTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-bold">
                    {formatTime(booking.availability.startTime)} - {formatTime(booking.availability.endTime)}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Session length: <span className="font-bold">{booking.sessionLength} Minutes</span>
                </div>
              </div>
            </div>

            {booking.van.hasAttendant && (
              <div className="pt-3 border-t border-[#E5E1D8]/40 flex justify-between text-xs text-muted-foreground leading-normal">
                <span>Dedicated Attendant:</span>
                <span className="font-bold text-primary">{booking.van.attendantName}</span>
              </div>
            )}
          </div>

          {/* QR Code and Ticket Box */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="border border-[#E5E1D8] p-4 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <QrCode className="w-24 h-24 text-primary" />
            </div>
            <div className="text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-bold">Ticket Entry Code</span>
              <span className="font-mono text-xl font-bold text-primary tracking-widest mt-1 block">
                {booking.bookingCode}
              </span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-[#FAF8F5] flex flex-col sm:flex-row justify-center gap-4">
            {booking.van && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${
                  booking.van.currentLatitude || booking.van.latitude
                },${booking.van.currentLongitude || booking.van.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-md text-white bg-secondary hover:bg-secondary/95 shadow transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 fill-white" />
                Navigate to Van
              </a>
            )}
            <Link
              href="/customer/dashboard"
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-md text-primary bg-[#FCF9F6] border border-[#E5E1D8] hover:bg-gray-50 transition-all"
            >
              View My Bookings
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
