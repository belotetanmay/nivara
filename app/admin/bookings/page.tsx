'use client';

import React, { useState, useEffect } from 'react';
import { CalendarRange, ShieldAlert, RefreshCw, CheckCircle, ChevronDown, Award } from 'lucide-react';

interface Booking {
  id: string;
  bookingCode: string;
  sessionLength: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
  van: {
    title: string;
    address: string;
  };
  vendor: {
    businessName: string;
  };
  availability: {
    startTime: string;
    endTime: string;
  };
  payment: {
    id: string;
    amount: number;
    status: string;
    gatewayRef: string | null;
  } | null;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [overrideStatusId, setOverrideStatusId] = useState<string | null>(null); // Booking ID currently opening status selector dropdown

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings(data.bookings || []);
      } else {
        setError(data.error || 'Failed to fetch bookings ledger.');
      }
    } catch (e) {
      setError('An error occurred loading bookings oversight logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOverrideStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    setError(null);
    setSuccess(null);
    setOverrideStatusId(null);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message || `Booking status successfully overridden to ${newStatus}.`);
        await fetchBookings();
      } else {
        setError(data.error || 'Failed to override booking status.');
      }
    } catch (err) {
      setError('Error while overriding booking status.');
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-secondary/15 text-secondary border border-secondary/20';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-[#E5E1D8] shadow-md">
      
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-primary">Booking Oversight</h1>
        <p className="text-xs text-muted-foreground mt-1">Override transaction states, trigger manual cancellations, and inspect payment gateways logs.</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded text-xs flex gap-2 items-center">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-center py-12 text-xs text-muted-foreground">No bookings recorded on the platform yet.</p>
      ) : (
        <div className="overflow-x-auto border border-[#E5E1D8] rounded-xl shadow-sm">
          <table className="w-full text-xs text-left font-sans text-primary">
            <thead>
              <tr className="bg-[#FCF9F6] border-b border-[#E5E1D8] text-muted-foreground">
                <th className="p-3 font-semibold">Booking Code</th>
                <th className="p-3 font-semibold">Traveler (Customer)</th>
                <th className="p-3 font-semibold">wellness pod (Host)</th>
                <th className="p-3 font-semibold">Scheduled slot</th>
                <th className="p-3 font-semibold">Fare Paid</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Oversight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF8F5]">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#FCF9F6]/25 transition-colors">
                  
                  {/* Code */}
                  <td className="p-3 font-mono font-bold tracking-wider text-muted-foreground uppercase">
                    {b.bookingCode}
                  </td>
                  
                  {/* Customer */}
                  <td className="p-3">
                    <span className="font-semibold block">{b.customer.name}</span>
                    <span className="text-[10px] text-muted-foreground">{b.customer.email}</span>
                  </td>
                  
                  {/* Van and Host */}
                  <td className="p-3">
                    <span className="font-semibold block truncate max-w-[150px]">{b.van.title}</span>
                    <span className="text-[10px] text-muted-foreground">Host: {b.vendor.businessName}</span>
                  </td>
                  
                  {/* Slot */}
                  <td className="p-3 text-muted-foreground leading-normal">
                    <span className="font-medium block text-primary">{formatDate(b.availability.startTime)}</span>
                    <span>{formatTime(b.availability.startTime)} - {formatTime(b.availability.endTime)} ({b.sessionLength} min)</span>
                  </td>
                  
                  {/* Fare */}
                  <td className="p-3">
                    <span className="font-bold block">₹{b.payment?.amount || 0}</span>
                    <span className={`text-[9px] font-bold block ${
                      b.payment?.status === 'SUCCESS' ? 'text-secondary' : 'text-muted-foreground'
                    }`}>
                      {b.payment?.status || 'UNPAID'}
                    </span>
                  </td>
                  
                  {/* Status */}
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(b.status)}`}>
                      {b.status}
                    </span>
                  </td>

                  {/* Oversight action override */}
                  <td className="p-3 text-right relative">
                    {updatingId === b.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground inline" />
                    ) : (
                      <div className="inline-block text-left">
                        <button
                          onClick={() => setOverrideStatusId(overrideStatusId === b.id ? null : b.id)}
                          className="px-2.5 py-1 bg-white border border-[#E5E1D8] text-primary rounded font-bold hover:bg-gray-50 text-[10px] inline-flex items-center gap-1"
                        >
                          Override <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Overlay dropdown */}
                        {overrideStatusId === b.id && (
                          <div className="absolute right-3 mt-1.5 w-32 bg-white border border-[#E5E1D8] rounded-md shadow-lg z-20 py-1 text-[10px] text-left font-semibold text-primary">
                            <button
                              onClick={() => handleOverrideStatus(b.id, 'PENDING')}
                              className="w-full px-3 py-1.5 hover:bg-[#FCF9F6] transition-colors"
                            >
                              Set Pending
                            </button>
                            <button
                              onClick={() => handleOverrideStatus(b.id, 'CONFIRMED')}
                              className="w-full px-3 py-1.5 hover:bg-[#FCF9F6] transition-colors"
                            >
                              Set Confirmed
                            </button>
                            <button
                              onClick={() => handleOverrideStatus(b.id, 'COMPLETED')}
                              className="w-full px-3 py-1.5 hover:bg-[#FCF9F6] transition-colors"
                            >
                              Set Completed
                            </button>
                            <button
                              onClick={() => handleOverrideStatus(b.id, 'CANCELLED')}
                              className="w-full px-3 py-1.5 hover:bg-red-50 text-red-600 transition-colors"
                            >
                              Force Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
