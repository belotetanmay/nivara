'use client';

import React from 'react';
import LinkComponent from 'next/link';
import Image from 'next/image';
import { useAuth } from './AuthContext';
import { ShieldCheck, User as UserIcon, LogOut, CheckCircle2, AlertCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'vendor'>('customer');

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <LinkComponent href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/nivara_logo_transparent.png"
                alt="Nivara Logo"
                width={160}
                height={56}
                className="h-14 w-auto object-contain block"
                priority
              />
            </LinkComponent>

            {/* Middle navigation based on role */}
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              {!user && (
                <>
                  <LinkComponent href="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </LinkComponent>
                  <LinkComponent href="/customer/search" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Locations
                  </LinkComponent>
                  <LinkComponent href="/#how-it-works" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    How it Works
                  </LinkComponent>
                  <LinkComponent href="/about" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </LinkComponent>
                </>
              )}

              {user?.role === 'CUSTOMER' && (
                <>
                  <LinkComponent href="/customer/search" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Locations
                  </LinkComponent>
                  <LinkComponent href="/customer/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    My Bookings
                  </LinkComponent>
                  <LinkComponent href="/customer/kyc" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    KYC Verification
                  </LinkComponent>
                </>
              )}

              {user?.role === 'VENDOR' && (
                <>
                  <LinkComponent href="/vendor/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Inbox & Earnings
                  </LinkComponent>
                  <LinkComponent href="/vendor/vans" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Manage Vans
                  </LinkComponent>
                  <LinkComponent href="/vendor/calendar" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Availability Calendar
                  </LinkComponent>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <LinkComponent href="/admin/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Dashboard
                  </LinkComponent>
                  <LinkComponent href="/admin/approvals" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Approvals Queue
                  </LinkComponent>
                  <LinkComponent href="/admin/users" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Manage Users
                  </LinkComponent>
                  <LinkComponent href="/admin/audit-logs" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Audit Logs
                  </LinkComponent>
                </>
              )}
            </div>
          </div>

          {/* Right side auth buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!loading && user && (
              <div className="flex items-center gap-3">
                {/* KYC Badge for customers */}
                {user.role === 'CUSTOMER' && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.kycStatus === 'VERIFIED'
                      ? 'bg-secondary/10 text-secondary border border-secondary/20'
                      : user.kycStatus === 'PENDING'
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'bg-red-500/10 text-red-600 border border-red-500/20'
                  }`}>
                    {user.kycStatus === 'VERIFIED' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Traveler
                      </>
                    ) : user.kycStatus === 'PENDING' ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" /> KYC Pending
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" /> KYC Unverified
                      </>
                    )}
                  </div>
                )}

                {/* Vendor verification status badge */}
                {user.role === 'VENDOR' && user.vendorProfile && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.vendorProfile.verificationStatus === 'APPROVED'
                      ? 'bg-secondary/10 text-secondary border border-secondary/20'
                      : user.vendorProfile.verificationStatus === 'PENDING'
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'bg-red-500/10 text-red-600 border border-red-500/20'
                  }`}>
                    {user.vendorProfile.verificationStatus === 'APPROVED' ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Host
                      </>
                    ) : user.vendorProfile.verificationStatus === 'PENDING' ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" /> Awaiting Vetting
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" /> Host Suspended
                      </>
                    )}
                  </div>
                )}

                {/* Admin badge */}
                {user.role === 'ADMIN' && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground border border-primary/20">
                    Founder Admin
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-sm font-medium text-primary ml-2">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{user.name.split(' ')[0]}</span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}

            {!loading && !user && (
              <div className="flex items-center gap-3">
                {pathname !== '/login' && (
                  <LinkComponent
                    href="/login"
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-shadow"
                  >
                    Sign In
                  </LinkComponent>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-foreground hover:text-primary p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-2 pt-2 pb-4 space-y-1">
          {!user && (
            <>
              <LinkComponent href="/" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                Home
              </LinkComponent>
              <LinkComponent href="/customer/search" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                Locations
              </LinkComponent>
              <LinkComponent href="/#how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                How it Works
              </LinkComponent>
              <LinkComponent href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                About Us
              </LinkComponent>
              <LinkComponent href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-background">
                Sign In
              </LinkComponent>
              <LinkComponent href="/login?role=vendor" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                Host a Van
              </LinkComponent>
            </>
          )}

          {user?.role === 'CUSTOMER' && (
            <>
              <LinkComponent href="/customer/search" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                Locations
              </LinkComponent>
              <LinkComponent href="/customer/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                My Bookings
              </LinkComponent>
              <LinkComponent href="/customer/kyc" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                KYC Verification
              </LinkComponent>
            </>
          )}

          {user?.role === 'VENDOR' && (
            <>
              <LinkComponent href="/vendor/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                Inbox & Earnings
              </LinkComponent>
              <LinkComponent href="/vendor/vans" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                Manage Vans
              </LinkComponent>
              <LinkComponent href="/vendor/calendar" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                Availability Calendar
              </LinkComponent>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <LinkComponent href="/admin/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                Dashboard
              </LinkComponent>
              <LinkComponent href="/admin/approvals" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                Approvals Queue
              </LinkComponent>
              <LinkComponent href="/admin/users" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                Manage Users
              </LinkComponent>
              <LinkComponent href="/admin/audit-logs" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-background">
                Audit Logs
              </LinkComponent>
            </>
          )}

          {user && (
            <div className="pt-4 border-t border-border mt-4 px-3 flex flex-col gap-3">
              <div className="text-sm font-semibold text-primary">Logged in as {user.name}</div>
              <button
                onClick={logout}
                className="w-full text-center px-4 py-2 border border-red-200 text-red-600 rounded-md text-base font-medium hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
