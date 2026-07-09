'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isProtectedRoute = 
    pathname.startsWith('/customer/dashboard') || 
    pathname.startsWith('/customer/kyc') || 
    pathname.startsWith('/customer/bookings') || 
    pathname.startsWith('/customer/review');

  useEffect(() => {
    if (!loading && isProtectedRoute) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'CUSTOMER' && user.role !== 'ADMIN') {
        router.push('/login?unauthorized=true');
      }
    }
  }, [user, loading, pathname, router, isProtectedRoute]);

  // Render spinner wrapper only for protected customer paths that are verifying auth state
  if (!loading && isProtectedRoute && (!user || (user.role !== 'CUSTOMER' && user.role !== 'ADMIN'))) {
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

  return <>{children}</>;
}
