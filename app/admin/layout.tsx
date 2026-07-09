'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, BarChart3, Users, Landmark, CalendarRange, ShieldAlert } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/login?unauthorized=true');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <div className="flex-grow flex">
        {/* Fixed Left Sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-100 border-r border-slate-800 flex-shrink-0 hidden md:block">
          <div className="p-6 space-y-6">
            <div>
              <span className="text-[10px] text-primary uppercase tracking-widest block font-black">Admin Console</span>
              <h2 className="text-sm font-bold tracking-tight text-white mt-1">Founder Panel</h2>
            </div>

            <nav className="space-y-1 text-xs font-semibold">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-slate-300 hover:text-white"
              >
                <BarChart3 className="w-4 h-4 text-primary" />
                <span>Overview Dashboard</span>
              </Link>
              <Link
                href="/admin/approvals"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-slate-300 hover:text-white"
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Approvals Queue</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-slate-300 hover:text-white"
              >
                <Users className="w-4 h-4 text-primary" />
                <span>Manage Users</span>
              </Link>
              <Link
                href="/admin/bookings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-slate-300 hover:text-white"
              >
                <CalendarRange className="w-4 h-4 text-primary" />
                <span>Oversight Bookings</span>
              </Link>
              <Link
                href="/admin/audit-logs"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-slate-300 hover:text-white"
              >
                <ShieldAlert className="w-4 h-4 text-primary" />
                <span>Immutable Audit Logs</span>
              </Link>
            </nav>

            <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-400 leading-relaxed">
              * The founder has unilateral read/write platform visibility. Every action is written to immutable logs.
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow p-4 sm:p-8">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}
