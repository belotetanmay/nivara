'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <Image
                src="/nivara_logo_transparent.png"
                alt="Nivara Logo"
                width={160}
                height={56}
                className="h-12 w-auto object-contain block brightness-0 invert"
              />
            </div>
            <p className="text-slate-400 text-sm max-w-sm font-sans font-light leading-relaxed">
              Next-gen Immersive Vehicle for Active Recovery & Awareness. Escape the chaos, step into your private relaxation pod, and regain your focus.
            </p>
            <div className="text-primary text-sm font-sans italic font-semibold">
              &quot;Escape the Chaos, Find Your Calm&quot;
            </div>
          </div>

          {/* Links: Platform */}
          <div>
            <h3 className="font-sans text-sm font-extrabold tracking-wide mb-4 text-white uppercase">Platform</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/customer/search" className="hover:text-white transition-colors">
                  Find Wellness Vans
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/login?role=vendor" className="hover:text-white transition-colors">
                  Join as Host Partner
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Partner Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Legal & Contact */}
          <div>
            <h3 className="font-sans text-sm font-extrabold tracking-wide mb-4 text-white uppercase">Support</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="block">Email: contact@nivara.com</span>
              </li>
              <li>
                <span className="block">Phone: +91 99999 99999</span>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Nivara Technologies Private Limited. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed for ultimate recovery and mindfulness.</p>
        </div>
      </div>
    </footer>
  );
}
