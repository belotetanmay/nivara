'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, MapPin, Inbox, CreditCard, ShieldCheck, AlertTriangle, ArrowUpRight, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

interface Booking {
  id: string;
  bookingCode: string;
  sessionLength: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
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
  businessName: string;
  bio: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason: string | null;
  payoutDetails: string;
  ratingAvg: number;
  totalBookings: number;
}

export default function VendorDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState({ totalEarnings: 0, completedSessionsCount: 0, payoutDetails: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showPastSessions, setShowPastSessions] = useState(false);

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

  const handleCompleteBooking = async (bookingId: string) => {
    setUpdatingId(bookingId);
    setError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/vendor/bookings/${bookingId}/complete`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess('Booking marked as completed. Earnings added to ledger.');
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
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        </div>
        <Footer />
      </div>
    );
  }

  // Account not approved view
  if (vendorProfile && vendorProfile.verificationStatus !== 'APPROVED') {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-16 sm:px-6">
          <div className="bg-white border border-[#E5E1D8] p-8 sm:p-12 rounded-xl text-center space-y-6 shadow-sm">
            
            {vendorProfile.verificationStatus === 'PENDING' && (
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
            )}

            {vendorProfile.verificationStatus === 'REJECTED' && (
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
            )}

            {vendorProfile.verificationStatus === 'SUSPENDED' && (
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
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E1D8] pb-6">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">{vendorProfile?.businessName}</h1>
              <p className="text-sm text-muted-foreground">Manage your cabins bookings inbox and review payouts ledger.</p>
            </div>
            
            <div className="flex gap-3">
              <Link
                href={`/vendor/portfolio/${user?.vendorProfile?.id}`}
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
              <div className="bg-white border border-[#E5E1D8] rounded-xl p-6 shadow-sm space-y-4">
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

                        <div className="flex gap-3 pt-2">
                          {booking.status === 'PENDING' && (
                            <button
                              onClick={() => handleConfirmBooking(booking.id)}
                              disabled={updatingId === booking.id}
                              className="flex-grow py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              Confirm Booking
                            </button>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCompleteBooking(booking.id)}
                              disabled={updatingId === booking.id}
                              className="flex-grow py-2 bg-secondary hover:bg-secondary/95 text-primary-foreground font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              Mark Session Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Collapsible Past Bookings logs */}
              <div className="bg-white border border-[#E5E1D8] rounded-xl p-6 shadow-sm space-y-4">
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
              <div className="bg-white border border-[#E5E1D8] rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-[#FAF8F5]">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                  <h2 className="font-serif text-lg font-bold text-primary">Earnings Ledger</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-bold">Total Disbursed Revenue</span>
                    <span className="text-3xl font-serif font-bold text-primary mt-1 block">
                      ₹{earnings.totalEarnings.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#FAF8F5]">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Completed Sessions</span>
                      <span className="text-lg font-serif font-bold text-primary mt-0.5 block">{earnings.completedSessionsCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Partner Rating</span>
                      <span className="text-lg font-serif font-bold text-primary mt-0.5 block">
                        {vendorProfile?.ratingAvg ? vendorProfile.ratingAvg.toFixed(1) : '0.0'} ★
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout banking info card */}
              <div className="bg-white border border-[#E5E1D8] rounded-xl p-6 shadow-sm space-y-4">
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

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
