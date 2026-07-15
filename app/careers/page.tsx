'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, Briefcase, FileText, CheckCircle } from 'lucide-react';

export default function Careers() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Attendant',
    why: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-16 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
            <Compass className="w-3.5 h-3.5" /> Work With Us
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-primary leading-tight">
            Join the Sanctuary Movement
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            At Nivara, we are building technology and operating premium mobile wellness pods to restore peace to urban centers. We are seeking passionate builders, coordinators, and attendants to expand our pilot in Mumbai & Thane.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Active Job Openings (Left Column) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border-b border-[#E5E1D8] pb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-secondary" />
              <h2 className="font-serif text-xl font-bold text-primary">Open Positions</h2>
            </div>

            <div className="space-y-4">
              {/* Job 1 */}
              <div className="bg-white border border-[#E5E1D8] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-3 text-primary">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-serif text-base font-bold">Cabin Operations Attendant</h3>
                  <span className="bg-secondary/10 text-secondary border border-secondary/20 text-[9px] px-2 py-0.5 rounded-full font-bold">Mumbai</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Support onboarding for customers, configure soundproofing, aroma settings, and maintain the hygiene protocol inside relaxation capsules between sessions.
                </p>
                <div className="text-[10px] text-slate-400 font-medium">Full-Time • Shift Operations</div>
              </div>

              {/* Job 2 */}
              <div className="bg-white border border-[#E5E1D8] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-3 text-primary">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-serif text-base font-bold">Full-Stack Next.js Developer</h3>
                  <span className="bg-secondary/10 text-secondary border border-secondary/20 text-[9px] px-2 py-0.5 rounded-full font-bold">Remote / Mumbai</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Enhance slot reservation logic, integrate payment gateways (Stripe/Razorpay), geocode map vectors, and improve partner dispatch flightdeck trackers.
                </p>
                <div className="text-[10px] text-slate-400 font-medium">Full-Time • Next.js & Prisma Stack</div>
              </div>

              {/* Job 3 */}
              <div className="bg-white border border-[#E5E1D8] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-3 text-primary">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-serif text-base font-bold">Territory Fleet Specialist</h3>
                  <span className="bg-secondary/10 text-secondary border border-secondary/20 text-[9px] px-2 py-0.5 rounded-full font-bold">Thane West</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Manage coordinate parameters, route scheduling limits, host locations parking relations, and coordinate charging dock resources.
                </p>
                <div className="text-[10px] text-slate-400 font-medium">Full-Time • Logistics & Fleet Management</div>
              </div>
            </div>
          </div>

          {/* Application Form (Right Column) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#E5E1D8] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
              <div className="border-b border-[#FAF8F5] pb-4 flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5 text-secondary" />
                <h2 className="font-serif text-lg font-bold">Apply Now</h2>
              </div>

              {submitted ? (
                <div className="text-center py-8 space-y-4 text-primary">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto text-green-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold">Application Received!</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Thank you for applying to Nivara. Our recruiting team will review your profile and reach out within 3 business days.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-xs text-secondary font-bold hover:underline"
                  >
                    Submit another application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs text-primary">
                  <div className="space-y-1">
                    <label className="block font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Tanmay Belote"
                      className="w-full p-2.5 border border-[#E5E1D8] rounded bg-[#FCF9F6]/20 focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. tanmay@example.com"
                      className="w-full p-2.5 border border-[#E5E1D8] rounded bg-[#FCF9F6]/20 focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold uppercase tracking-wider text-muted-foreground">Target Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full p-2.5 border border-[#E5E1D8] rounded bg-white focus:outline-none focus:border-secondary"
                    >
                      <option value="Attendant">Cabin Operations Attendant</option>
                      <option value="Developer">Full-Stack Next.js Developer</option>
                      <option value="Fleet">Territory Fleet Specialist</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold uppercase tracking-wider text-muted-foreground">Why Nivara?</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.why}
                      onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                      placeholder="Briefly tell us why you want to help people reclaim peace..."
                      className="w-full p-2.5 border border-[#E5E1D8] rounded bg-[#FCF9F6]/20 focus:outline-none focus:border-secondary leading-normal"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary hover:bg-primary/95 text-white rounded text-xs font-bold shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Submitting profile...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
