'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Receipt, MessageSquare, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface Booking {
  id: string;
  bookingCode: string;
  sessionLength: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  serviceModel: string;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  includeParkingFee: boolean;
  parkingFeeAmount: number;
  actualDuration: number | null;
  overtimeMinutes: number;
  overtimeAmount: number;
  overtimeStatus: string;
  van: {
    title: string;
    address: string;
    hasAttendant: boolean;
    attendantName: string | null;
  };
  availability: {
    startTime: string;
    endTime: string;
  };
  payment: {
    amount: number;
    status: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    currency: string;
  } | null;
  review: {
    id: string;
  } | null;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [payingOvertimeId, setPayingOvertimeId] = useState<string | null>(null);

  const handlePayOvertime = async (bookingId: string) => {
    setPayingOvertimeId(bookingId);
    setError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/customer/bookings/${bookingId}/pay-overtime`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess('Overtime fee paid successfully!');
        await fetchBookings();
      } else {
        setError(data.error || 'Failed to pay overtime fee.');
      }
    } catch (e) {
      setError('An error occurred completing overtime payment.');
    } finally {
      setPayingOvertimeId(null);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/customer/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      } else {
        setError('Failed to fetch bookings list.');
      }
    } catch (e) {
      setError('An error occurred loading bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchBookings();
      } else {
        router.push('/login');
      }
    }
  }, [user, authLoading]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this wellness pod session? This action cannot be undone.')) {
      return;
    }

    setCancellingId(bookingId);
    setError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/customer/bookings/${bookingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.message || 'Booking cancelled and slot released successfully.');
        await fetchBookings();
      } else {
        setError(data.error || 'Failed to cancel booking.');
      }
    } catch (err: any) {
      setError('Error while cancelling session.');
    } finally {
      setCancellingId(null);
    }
  };

  // Real-time computed metrics based on database records
  const totalMinutesRelaxed = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.sessionLength, 0);

  const upcomingCount = bookings
    .filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED')
    .length;

  const spent = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.payment?.amount || 0), 0);
  const walletBalance = Math.max(0, 2500 - spent);

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') {
      return b.status === 'PENDING' || b.status === 'CONFIRMED';
    } else if (activeTab === 'past') {
      return b.status === 'COMPLETED';
    } else {
      return b.status === 'CANCELLED';
    }
  });

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

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-secondary/15 text-secondary border border-secondary/20';
      case 'PENDING':
        return 'bg-accent/15 text-accent border border-[#E5E1D8]';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  };

  const handlePrintReceipt = (booking: Booking) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Nivara Receipt - ${booking.bookingCode}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0A2540; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #2C5234; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; }
            .details { margin-bottom: 30px; }
            .details table { width: 100%; border-collapse: collapse; }
            .details td { padding: 8px 0; border-bottom: 1px solid #E5E1D8; }
            .details td.label { font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #8F8C87; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">NIVARA</div>
            <div>Official Payment Receipt</div>
          </div>
          <div class="details">
            <table>
              <tr><td class="label">Booking Code</td><td>${booking.bookingCode}</td></tr>
              <tr><td class="label">Wellness Pod</td><td>${booking.van.title}</td></tr>
              <tr><td class="label">Location</td><td>${booking.van.address}</td></tr>
              <tr><td class="label">Date</td><td>${formatDate(booking.availability.startTime)}</td></tr>
              <tr><td class="label">Time Slot</td><td>${formatTime(booking.availability.startTime)} - ${formatTime(booking.availability.endTime)}</td></tr>
              <tr><td class="label">Duration</td><td>${booking.sessionLength} Minutes</td></tr>
              <tr><td class="label">Payment Status</td><td>${booking.payment?.status || 'Paid'}</td></tr>
              <tr><td class="label">Attendant Status</td><td>${booking.van.hasAttendant ? booking.van.attendantName : 'Self Service'}</td></tr>
            </table>
          </div>
          <div class="total">Total Paid: INR ${booking.payment?.amount || 0}</div>
          <div class="footer">Thank you for letting us help you escape the chaos. If you have any inquiries, email contact@nivara.com</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

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
            <div className="h-10 w-32 shimmer-skeleton"></div>
          </div>

          {/* Metrics Pane Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-28 w-full shimmer-skeleton"></div>
            <div className="h-28 w-full shimmer-skeleton"></div>
            <div className="h-28 w-full shimmer-skeleton"></div>
          </div>

          {/* Navigation Tabs Skeleton */}
          <div className="flex gap-4 border-b border-[#E5E1D8] pb-1">
            <div className="h-8 w-24 shimmer-skeleton"></div>
            <div className="h-8 w-24 shimmer-skeleton"></div>
            <div className="h-8 w-24 shimmer-skeleton"></div>
          </div>

          {/* Cards List Skeleton */}
          <div className="space-y-4">
            <div className="h-32 w-full shimmer-skeleton"></div>
            <div className="h-32 w-full shimmer-skeleton"></div>
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
              <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">My Wellness Sessions</h1>
              <p className="text-sm text-muted-foreground">Manage your upcoming pods and review past recovery logs.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('trigger-demo-session'));
                }}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md text-primary bg-[#FAF8F5] border border-[#E5E1D8] hover:bg-gray-50 shadow-sm transition-all cursor-pointer"
              >
                🔧 Trigger Alerts Demo
              </button>
              <Link
                href="/customer/search"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all"
              >
                Book New Session
              </Link>
            </div>
          </div>

          {/* Metrics Pane */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Time Relaxed</p>
                <p className="text-3xl font-black text-primary mt-1">{totalMinutesRelaxed} mins</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Upcoming Bookings</p>
                <p className="text-3xl font-black text-secondary mt-1">{upcomingCount} sessions</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Virtual Wallet</p>
                <p className="text-3xl font-black text-slate-900 mt-1">₹{walletBalance.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                <Receipt className="w-5 h-5" />
              </div>
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
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500" />
              <div>{actionSuccess}</div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#E5E1D8]">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all ${
                activeTab === 'upcoming'
                  ? 'border-secondary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-primary'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all ${
                activeTab === 'past'
                  ? 'border-secondary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-primary'
              }`}
            >
              Past Sessions
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all ${
                activeTab === 'cancelled'
                  ? 'border-secondary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-primary'
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="glass-card text-center space-y-4 p-12">
              <div className="w-12 h-12 rounded-full bg-[#FCF9F6] flex items-center justify-center mx-auto text-muted-foreground">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-primary">No sessions found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {activeTab === 'upcoming' 
                  ? 'You do not have any upcoming wellness van slots booked. Find a pod nearby and escape the noise.'
                  : activeTab === 'past'
                  ? 'You do not have any past recovery logs. Book a zero-gravity cabin to begin.'
                  : 'No cancelled bookings.'}
              </p>
              {activeTab === 'upcoming' && (
                <div className="pt-2">
                  <Link
                    href="/customer/search"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md text-primary bg-[#FCF9F6] border border-[#E5E1D8] hover:bg-gray-50 transition-all"
                  >
                    Locate Vans Nearby
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="glass-card flex flex-col hover:shadow-md transition-all"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-[#FAF8F5] flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-serif text-base font-bold text-primary leading-tight">{booking.van.title}</h3>
                      <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">{booking.bookingCode}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-grow space-y-3.5 text-xs text-primary">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed text-muted-foreground">{booking.van.address}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>{formatDate(booking.availability.startTime)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-semibold">
                        {formatTime(booking.availability.startTime)} - {formatTime(booking.availability.endTime)}
                        <span className="text-muted-foreground font-normal ml-1">({booking.sessionLength} min)</span>
                      </span>
                    </div>

                    {booking.payment && (
                      <div className="pt-2 border-t border-[#FAF8F5] flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Amount Paid:</span>
                        <span className="font-bold text-primary">
                          INR {booking.payment.amount}
                        </span>
                      </div>
                    )}

                    {/* Service model badge */}
                    <div className="text-[11px] bg-slate-50 border border-slate-200/60 p-2 rounded text-muted-foreground space-y-1">
                      <div className="flex justify-between items-center">
                        <span>Service Mode:</span>
                        <span className="font-bold text-primary">
                          {booking.serviceModel === 'PICK_AND_DROP' ? '🚗 Pick & Drop' : '📍 Steady Position'}
                        </span>
                      </div>
                      {booking.serviceModel === 'PICK_AND_DROP' && (
                        <div className="text-[10px] border-t border-slate-200/40 pt-1 space-y-0.5">
                          <p><span className="font-semibold">Pick-up:</span> {booking.pickupAddress}</p>
                          <p><span className="font-semibold">Drop-off:</span> {booking.dropoffAddress}</p>
                        </div>
                      )}
                    </div>

                    {/* Overtime charge warnings */}
                    {booking.overtimeStatus === 'UNPAID' && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs space-y-2">
                        <div className="flex gap-1.5 items-start text-amber-800 font-medium">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 animate-pulse" />
                          <div>
                            <span className="font-bold">Overtime Charge Pending</span>
                            <p className="text-[10px] text-amber-700 mt-0.5">
                              Spent {booking.actualDuration} min inside van (+{booking.overtimeMinutes} min overtime).
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-1.5 border-t border-amber-200/60">
                          <span className="font-bold text-amber-900 text-xs">Fee: ₹{booking.overtimeAmount}</span>
                          <button
                            onClick={() => handlePayOvertime(booking.id)}
                            disabled={payingOvertimeId === booking.id}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-2.5 py-1 rounded shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {payingOvertimeId === booking.id ? 'Processing...' : 'Pay Fee'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {booking.overtimeStatus === 'PAID' && (
                      <div className="p-2.5 bg-green-50 border border-green-200 rounded text-[10px] text-green-700 flex items-center gap-1.5 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span>Paid Overtime (Spent {booking.actualDuration} min - ₹{booking.overtimeAmount})</span>
                      </div>
                    )}

                    {booking.van.hasAttendant && (
                      <div className="text-[11px] bg-[#FCF9F6] p-2 rounded border border-[#E5E1D8]/40 text-muted-foreground flex justify-between">
                        <span>Van Attendant:</span>
                        <span className="font-medium text-primary">{booking.van.attendantName}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="p-5 border-t border-[#FAF8F5] bg-[#FCF9F6]/40 rounded-b-xl flex gap-3">
                    {/* Cancellation Action */}
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="flex-1 py-2 border border-red-200 text-red-600 rounded text-xs font-semibold hover:bg-red-50 transition-all text-center flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : 'Cancel Session'}
                      </button>
                    )}

                    {/* Receipt Action */}
                    {booking.payment?.status === 'SUCCESS' && (
                      <button
                        onClick={() => handlePrintReceipt(booking)}
                        className="flex-1 py-2 bg-white border border-[#E5E1D8] text-primary rounded text-xs font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" /> Receipt
                      </button>
                    )}

                    {/* Review Action */}
                    {booking.status === 'COMPLETED' && !booking.review && (
                      <Link
                        href={`/customer/review/${booking.id}`}
                        className="flex-1 py-2 bg-secondary text-primary-foreground rounded text-xs font-semibold hover:bg-secondary/95 transition-all text-center flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Leave Review
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
