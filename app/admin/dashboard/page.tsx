'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { BarChart3, Users, Landmark, AlertTriangle, ShieldCheck, ArrowUpRight, DollarSign, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: string;
  bookingCode: string;
  status: string;
  createdAt: string;
  customer: {
    name: string;
  };
  van: {
    title: string;
  };
  payment: {
    amount: number;
    status: string;
  } | null;
}

interface Stats {
  totalUsers: number;
  totalVendors: number;
  totalVans: number;
  activeVans: number;
  vansUnderReview: number;
  totalBookings: number;
  bookingsToday: number;
  gmv: number;
  pendingKycCount: number;
  pendingVendorCount: number;
  recentBookings: Booking[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch platform statistics.');
      }
    } catch (e) {
      setError('An error occurred loading admin overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 8000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="w-8 h-8 border-4 border-[#0F2D52]/30 border-t-[#0F2D52] rounded-full animate-spin"></span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center space-y-4 border border-[#E5E1D8] bg-white rounded-xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="font-sans text-xl font-bold text-[#0F2D52]">Overview Loading Error</h3>
        <p className="text-xs text-muted-foreground">{error || 'Unable to retrieve admin overview logs.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 page-entrance">
      
      {/* Welcome Head with Real-time indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-[#0F2D52]">Platform Control Center</h1>
          <p className="text-xs text-muted-foreground mt-1">Hello Founder. Monitor wellness vehicles active listings, verify users, and inspect logs.</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E5E1D8] px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] text-[#16A34A] font-bold uppercase shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
          </span>
          <span>Live Sync Active</span>
          <span className="text-slate-400 font-normal">| Refreshes every 8s</span>
        </div>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* GMV */}
        <div className="glass-card space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Gross Merchandise Value</span>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-sans font-bold text-[#0F2D52]">₹{stats.gmv.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-[#16A34A] font-semibold">100% SUCCESS</span>
          </div>
        </div>

        {/* Users */}
        <div className="glass-card space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Registered Customers</span>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-sans font-bold text-[#0F2D52]">{stats.totalUsers}</span>
            <span className="text-[10px] text-muted-foreground">Travelers</span>
          </div>
        </div>

        {/* Vendors */}
        <div className="glass-card space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Registered Hosts</span>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-sans font-bold text-[#0F2D52]">{stats.totalVendors}</span>
            <span className="text-[10px] text-muted-foreground">Van Operators</span>
          </div>
        </div>

        {/* Vans */}
        <div className="glass-card space-y-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Wellness Vehicles Fleet</span>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-sans font-bold text-[#0F2D52]">{stats.totalVans}</span>
            <span className="text-[10px] text-[#16A34A] font-semibold">{stats.activeVans} active</span>
          </div>
        </div>
      </div>

      {/* Review Actions Queue Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KYC queue card */}
        <div className="glass-card flex justify-between items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">KYC Verification Inbox</span>
            <span className="text-xl font-sans font-bold text-[#0F2D52] block">{stats.pendingKycCount} users pending verification</span>
            <p className="text-[10px] text-muted-foreground leading-normal max-w-xs pt-1">
              Review traveler identity cards and passport uploads to lift booking locks.
            </p>
          </div>

          <Link
            href="/admin/approvals"
            className="p-3 bg-[#16A34A]/10 hover:bg-[#16A34A]/15 text-[#16A34A] border border-[#16A34A]/20 rounded-lg transition-colors flex-shrink-0"
          >
            <ShieldCheck className="w-6 h-6" />
          </Link>
        </div>

        {/* Vendor queue card */}
        <div className="glass-card flex justify-between items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Host Vetting Inbox</span>
            <span className="text-xl font-sans font-bold text-[#0F2D52] block">{stats.pendingVendorCount} partners pending review</span>
            <p className="text-[10px] text-muted-foreground leading-normal max-w-xs pt-1">
              Approve partner onboarding applications and vehicle listings to open marketplace slot inventories.
            </p>
          </div>

          <Link
            href="/admin/approvals"
            className="p-3 bg-[#16A34A]/10 hover:bg-[#16A34A]/15 text-[#16A34A] border border-[#16A34A]/20 rounded-lg transition-colors flex-shrink-0"
          >
            <Landmark className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Recent bookings activity logs */}
      <div className="glass-card space-y-4">
        <div>
          <h2 className="font-sans text-lg font-bold text-[#0F2D52]">Recent Booking Activity</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Real-time listing logs of traveler reservations.</p>
        </div>

        <div className="border-t border-[#F7F9F8] pt-2">
          {stats.recentBookings.length === 0 ? (
            <p className="text-center py-6 text-xs text-muted-foreground">No bookings recorded on the platform yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-[#0F2D52] text-left font-sans">
                <thead>
                  <tr className="text-muted-foreground border-b border-[#F7F9F8]">
                    <th className="py-2.5 font-semibold">Booking Code</th>
                    <th className="py-2.5 font-semibold">Customer</th>
                    <th className="py-2.5 font-semibold">Wellness Van</th>
                    <th className="py-2.5 font-semibold">Timestamp</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold text-right">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F9F8]">
                  {stats.recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F7F9F8]/60 transition-colors">
                      <td className="py-3 font-mono font-bold tracking-wider text-muted-foreground uppercase">{b.bookingCode}</td>
                      <td className="py-3 font-semibold">{b.customer.name}</td>
                      <td className="py-3 truncate max-w-[150px] font-semibold">{b.van.title}</td>
                      <td className="py-3 text-muted-foreground">{formatDate(b.createdAt)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'CONFIRMED' || b.status === 'COMPLETED'
                            ? 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20'
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold">₹{b.payment?.amount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
