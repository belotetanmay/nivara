'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Upload, AlertCircle, RefreshCw, Check } from 'lucide-react';

export default function VendorOnboarding() {
  const { user, refreshUser, loading } = useAuth();
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'VENDOR') {
      router.push('/login');
      return;
    }

    if (user && user.vendorProfile) {
      const vp = user.vendorProfile;
      setBusinessName(vp.businessName);
      setBio(vp.bio);
      setPayoutDetails(vp.payoutDetails);
      
      // If already approved, direct back to dashboard
      if (vp.verificationStatus === 'APPROVED') {
        router.push('/vendor/dashboard');
      }
    }
  }, [user, router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDocFileUrl(data.fileUrl);
      } else {
        setError(data.error || 'Failed to upload verification documents.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName || !payoutDetails || !docFileUrl) {
      setError('Please provide business name, payout account, and upload verification license document.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Direct PATCH to update profile details and reset verificationStatus to PENDING
      // Wait, let's create a custom endpoint for resubmitting profiles or let vendor edit do it:
      // Let's create an onboarding patch route or edit vendorProfile directly in an API route.
      // Wait, let's write a simple onboarding PATCH endpoint in '/api/vendor/onboarding/route.ts'
      // which will handle updating the profile verification status to PENDING and saving files!
      // This is extremely clean and transaction-safe.
      const res = await fetch('/api/vendor/onboarding', {
        method: 'POST', // or POST/PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          bio,
          payoutDetails,
          licenseDocUrl: docFileUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        await refreshUser();
        setTimeout(() => {
          router.push('/vendor/dashboard');
        }, 1500);
      } else {
        setError(data.error || 'Failed to submit onboarding profile.');
      }
    } catch (err) {
      setError('An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-xl mx-auto w-full px-4 py-12 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-[#E5E1D8] shadow-md w-full space-y-6">
          <div className="text-center">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-primary">Partner Verification</h1>
            <p className="text-xs text-muted-foreground mt-1">Submit business credentials and payout info for host approval.</p>
          </div>

          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-secondary/15 text-secondary">
                <Check className="w-12 h-12" />
              </div>
              <h3 className="font-serif text-xl font-bold text-primary">Onboarding Request Submitted</h3>
              <p className="text-xs text-muted-foreground">
                Your partner details have been resubmitted successfully. Redirecting you to the status dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs text-primary">
              
              {error && (
                <div className="flex gap-2.5 items-start p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {user?.vendorProfile?.verificationStatus === 'REJECTED' && user.vendorProfile.rejectionReason && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded">
                  <span className="font-bold">Admin Rejection Log:</span>
                  <p className="mt-1 leading-normal">{user.vendorProfile.rejectionReason}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Business Name */}
                <div>
                  <label htmlFor="business" className="block text-xs font-semibold text-primary mb-1">
                    Business / Fleet Portfolio Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="business"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E1D8] rounded text-xs focus:outline-none"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-xs font-semibold text-primary mb-1">
                    Short Biography
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell recovery travelers about your team and wellness vehicle standard..."
                    className="w-full px-3 py-2 border border-[#E5E1D8] rounded text-xs focus:outline-none resize-none font-sans"
                  />
                </div>

                {/* Payout Details */}
                <div>
                  <label htmlFor="payout" className="block text-xs font-semibold text-primary mb-1">
                    Payout Destination Account Details <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="payout"
                    type="text"
                    required
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    placeholder="Bank Info (Name, Acc Number, IFSC) or UPI"
                    className="w-full px-3 py-2 border border-[#E5E1D8] rounded text-xs focus:outline-none"
                  />
                </div>

                {/* Upload Verification Document */}
                <div>
                  <label className="block text-xs font-semibold text-primary mb-2">
                    Upload Business License / ID Proof <span className="text-red-500">*</span>
                  </label>
                  <div className="relative border border-dashed border-[#E5E1D8] hover:border-secondary/40 rounded p-4 text-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-1 text-[11px] text-muted-foreground">
                      {isUploading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-secondary" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>Click to upload license image</span>
                    </div>
                  </div>

                  {docFileUrl && (
                    <div className="mt-2.5 flex items-center gap-2 text-[10px] text-secondary font-semibold bg-secondary/5 border border-secondary/15 p-2 rounded">
                      <ShieldCheck className="w-4.5 h-4.5" />
                      <span className="truncate">Saved File: {docFileUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading || !docFileUrl}
                  className="flex-grow py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all disabled:opacity-55"
                >
                  {isSubmitting ? 'Submitting Credentials...' : 'Submit Host Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/vendor/dashboard')}
                  className="py-3 px-6 border border-[#E5E1D8] text-primary rounded-md text-sm hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>

            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
