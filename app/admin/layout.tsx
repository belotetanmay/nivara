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
      <div className="flex flex-col min-h-screen bg-[#F7F9F8]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-[#0F2D52]/30 border-t-[#0F2D52] rounded-full animate-spin"></span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col font-sans">
      <Navbar />

      <div className="flex-grow flex">
        {/* Fixed Left Sidebar */}
        <aside className="w-64 bg-[#0F2D52] text-white border-r border-[#1E3A8A] flex-shrink-0 hidden md:block">
          <div className="p-6 space-y-6">
            <div>
              <span className="text-[10px] text-[#16A34A] uppercase tracking-widest block font-black font-sans">Admin Console</span>
              <h2 className="text-sm font-bold tracking-tight text-white mt-1">Founder Panel</h2>
            </div>

            <nav className="space-y-1 text-xs font-semibold">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-slate-200 hover:text-white"
              >
                <BarChart3 className="w-4 h-4 text-[#16A34A]" />
                <span>Overview Dashboard</span>
              </Link>
              <Link
                href="/admin/approvals"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-slate-200 hover:text-white"
              >
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Approvals Queue</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-slate-200 hover:text-white"
              >
                <Users className="w-4 h-4 text-[#16A34A]" />
                <span>Manage Users</span>
              </Link>
              <Link
                href="/admin/bookings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-slate-200 hover:text-white"
              >
                <CalendarRange className="w-4 h-4 text-[#16A34A]" />
                <span>Oversight Bookings</span>
              </Link>
              <Link
                href="/admin/audit-logs"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-slate-200 hover:text-white"
              >
                <ShieldAlert className="w-4 h-4 text-[#16A34A]" />
                <span>Immutable Audit Logs</span>
              </Link>
            </nav>

            <div className="pt-6 border-t border-[#1E3A8A] text-[10px] text-slate-300 leading-relaxed">
              * The founder has unilateral platform visibility. Every action is written to immutable logs.
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow p-4 sm:p-8 bg-[#F7F9F8]">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}
