'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, AlertCircle, FileText, Upload, Clock, CheckCircle } from 'lucide-react';

export default function KycPage() {
  const { user, refreshUser, loading } = useAuth();
  const [docType, setDocType] = useState('AADHAAR');
  const [docNumber, setDocNumber] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
        setFileUrl(data.fileUrl);
      } else {
        setError(data.error || 'Failed to upload document image.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) {
      setError('Please upload a photo of your identity document.');
      return;
    }
    if (!docNumber) {
      setError('Please enter your document identification number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/customer/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          docNumber,
          fileUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        await refreshUser();
      } else {
        setError(data.error || 'Failed to submit KYC documents.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during KYC submission.');
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

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="text-center md:text-left space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-primary">
              Identity Verification (KYC)
            </h1>
            <p className="text-muted-foreground text-sm font-sans">
              To guarantee physical safety and security, all Nivara users must pass a quick verification check before reserving their first relaxation pod slot.
            </p>
          </div>

          {/* KYC Status Screens */}
          {user?.kycStatus === 'VERIFIED' && (
            <div className="bg-white border border-[#E5E1D8] p-8 rounded-xl text-center space-y-4 shadow-sm">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-secondary/15 text-secondary">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-primary">Identity Verified</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Thank you! Your KYC documents have been reviewed and approved by our security administrators. You have unlimited access to reserve any active Nivara wellness pods.
              </p>
              <div className="pt-2">
                <a
                  href="/customer/search"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow-sm transition-all"
                >
                  Browse Wellness Vans
                </a>
              </div>
            </div>
          )}

          {user?.kycStatus === 'PENDING' && (
            <div className="bg-white border border-[#E5E1D8] p-8 rounded-xl text-center space-y-4 shadow-sm">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-accent/15 text-accent">
                <Clock className="w-12 h-12" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-primary">Verification in Progress</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                We have received your identity documents. Our verification officers are reviewing your submission. This check usually takes less than 30 minutes. We will notify you once completed.
              </p>
              <div className="pt-2">
                <a
                  href="/customer/dashboard"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-md text-primary bg-[#FCF9F6] border border-[#E5E1D8] hover:bg-gray-50 transition-all"
                >
                  View Bookings Dashboard
                </a>
              </div>
            </div>
          )}

          {(user?.kycStatus === 'UNVERIFIED' || user?.kycStatus === 'REJECTED') && !success && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Submission Form */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-[#E5E1D8] shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="font-serif text-xl font-bold text-primary">Submit Verification Documents</h2>

                  {user?.kycStatus === 'REJECTED' && (
                    <div className="flex gap-2.5 items-start p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                      <div>
                        <span className="font-semibold">Your previous submission was rejected.</span> Please review your details and re-upload clear photos of your ID proof.
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex gap-2.5 items-start p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                      <div>{error}</div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Doc Type */}
                    <div>
                      <label htmlFor="docType" className="block text-sm font-semibold text-primary mb-1">
                        Select Document Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="docType"
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E1D8] rounded-md text-sm bg-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                      >
                        <option value="AADHAAR">Aadhaar Card (India)</option>
                        <option value="PAN_CARD">PAN Card (India)</option>
                        <option value="PASSPORT">Passport (International)</option>
                        <option value="DRIVER_LICENSE">Driver&apos;s License</option>
                      </select>
                    </div>

                    {/* Doc Number */}
                    <div>
                      <label htmlFor="docNumber" className="block text-sm font-semibold text-primary mb-1">
                        Document Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="docNumber"
                        type="text"
                        required
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        placeholder="e.g. XXXX-XXXX-1234 or AlphaNumber"
                        className="w-full px-3 py-2 border border-[#E5E1D8] rounded-md text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                      />
                    </div>

                    {/* Document Upload file */}
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Upload ID Card Image <span className="text-red-500">*</span>
                      </label>
                      
                      <div className="relative border-2 border-dashed border-[#E5E1D8] hover:border-secondary/50 rounded-lg p-6 text-center cursor-pointer transition-all">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-2">
                          <div className="mx-auto w-10 h-10 rounded-md bg-[#FCF9F6] flex items-center justify-center text-muted-foreground">
                            {isUploading ? (
                              <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                            ) : (
                              <Upload className="w-5 h-5" />
                            )}
                          </div>
                          <div className="text-xs text-primary font-medium">
                            {fileUrl ? 'File Uploaded Successfully!' : 'Click to select or drag identity file'}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Supports PNG, JPG, or PDF (Max 5MB)
                          </p>
                        </div>
                      </div>

                      {fileUrl && (
                        <div className="mt-3 flex items-center gap-2 p-2 bg-secondary/5 border border-secondary/20 rounded-md text-xs text-secondary font-medium">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Saved Upload: {fileUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading || !fileUrl}
                    className="w-full py-2.5 px-4 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all disabled:opacity-55"
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Verification Request'}
                  </button>
                </form>
              </div>

              {/* Information / Side panel */}
              <div className="lg:col-span-5 bg-[#FCF9F6] p-6 rounded-xl border border-[#E5E1D8] space-y-6">
                <h3 className="font-serif text-lg font-bold text-primary">Why is KYC required?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nivara relaxation pods are privately locked, un-staffed, soundproofed cabins inside wellness vehicles. In order to maintain trust, prevent vandalism, and ensure customer safety, we verify the identity of every single user before they can enter.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-secondary border border-[#E5E1D8] flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-primary">Data Security</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        Your identity details are masked and stored inside encrypted parameters at rest, accessible only by security admins.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-secondary border border-[#E5E1D8] flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-primary">One-Time Submission</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        Once verified, you do not need to resubmit documents or verify for future slot purchases.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
