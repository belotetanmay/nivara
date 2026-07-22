'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Upload, AlertCircle, RefreshCw, Check, Landmark, Truck, FileText, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export default function VendorOnboarding() {
  const { user, refreshUser, loading } = useAuth();
  const router = useRouter();

  // Multi-step Onboarding State
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null); // tracks uploading field
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Personal KYC
  const [kycDocType, setKycDocType] = useState('ID_CARD');
  const [kycDocNumber, setKycDocNumber] = useState('');
  const [kycDocUrl, setKycDocUrl] = useState('');

  // Step 2: Business Validation
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [businessRegistrationNo, setBusinessRegistrationNo] = useState('');
  const [businessLicenseNo, setBusinessLicenseNo] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverLicenseNo, setDriverLicenseNo] = useState('');
  const [driverKycUrl, setDriverKycUrl] = useState('');

  // Step 3: Vehicle Details
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [rcUrl, setRcUrl] = useState('');
  const [insuranceUrl, setInsuranceUrl] = useState('');
  const [pucUrl, setPucUrl] = useState('');
  const [isCommercial, setIsCommercial] = useState(false);

  // Step 4: Photos & On-site Inspection Cert
  const [vanTitle, setVanTitle] = useState('');
  const [vanDescription, setVanDescription] = useState('');
  const [vanAmenities, setVanAmenities] = useState<string[]>(['Aromatherapy', 'Zero Gravity Chair', 'Soundproofing']);
  const [vanPrice15, setVanPrice15] = useState(999);
  const [vanPrice30, setVanPrice30] = useState(1499);
  const [vanPrice45, setVanPrice45] = useState(1999);
  const [vanPhotos, setVanPhotos] = useState<string[]>([]);
  const [onSiteInspectionCertUrl, setOnSiteInspectionCertUrl] = useState('');
  const [fakePhotoDeclaration, setFakePhotoDeclaration] = useState(false);

  const availableAmenities = [
    'Zero Gravity Chair',
    'Soundproofing',
    'Aromatherapy',
    'Ambient Lighting',
    'Air Conditioning',
    'Oxygen Therapy',
    'Calming Audio'
  ];

  useEffect(() => {
    if (user && user.role !== 'VENDOR') {
      router.push('/login');
      return;
    }

    if (user && user.vendorProfile) {
      const vp = user.vendorProfile;
      setBusinessName(vp.businessName);
      setBio(vp.bio);
      
      // If already approved, direct back to dashboard
      if (vp.verificationStatus === 'APPROVED') {
        router.push('/vendor/dashboard');
      }
    }
  }, [user, router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(fieldName);
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
        if (fieldName === 'kyc') setKycDocUrl(data.fileUrl);
        else if (fieldName === 'driverKyc') setDriverKycUrl(data.fileUrl);
        else if (fieldName === 'rc') setRcUrl(data.fileUrl);
        else if (fieldName === 'insurance') setInsuranceUrl(data.fileUrl);
        else if (fieldName === 'puc') setPucUrl(data.fileUrl);
        else if (fieldName === 'inspection') setOnSiteInspectionCertUrl(data.fileUrl);
        else if (fieldName === 'photos') setVanPhotos((prev) => [...prev, data.fileUrl]);
      } else {
        setError(data.error || 'Failed to upload verification documents.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(null);
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    if (vanAmenities.includes(amenity)) {
      setVanAmenities(vanAmenities.filter((a) => a !== amenity));
    } else {
      setVanAmenities([...vanAmenities, amenity]);
    }
  };

  const validateStep = () => {
    setError(null);
    if (currentStep === 1) {
      if (!kycDocNumber || !kycDocUrl) {
        setError('Please enter document number and upload personal KYC proof.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!businessName || !businessRegistrationNo || !businessLicenseNo || !gstNumber || !panNumber || !bankAccountNumber || !bankIfsc || !driverName || !driverLicenseNo || !driverKycUrl) {
        setError('Please complete all business validation fields and upload driver license/KYC.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!vehicleNumber || !chassisNumber || !rcUrl || !insuranceUrl || !pucUrl) {
        setError('Please enter vehicle info and upload RC, Insurance, and PUC certificates.');
        return false;
      }
      if (!isCommercial) {
        setError('Vehicle passing must be verified as a Commercial Vehicle to proceed.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!vanTitle || !vanDescription || !onSiteInspectionCertUrl || !fakePhotoDeclaration) {
      setError('Please provide vehicle title, description, inspection cert, and sign the fake photo declaration.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/vendor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kycDocType,
          kycDocNumber,
          kycDocUrl,
          businessName,
          bio,
          businessRegistrationNo,
          businessLicenseNo,
          gstNumber,
          panNumber,
          bankName,
          bankAccountNumber,
          bankIfsc,
          driverName,
          driverLicenseNo,
          driverKycUrl,
          vehicleNumber,
          chassisNumber,
          insuranceUrl,
          pucUrl,
          rcUrl,
          isCommercial,
          vanTitle,
          vanDescription,
          vanAmenities,
          vanPrice15,
          vanPrice30,
          vanPrice45,
          vanPhotos: vanPhotos.length > 0 ? vanPhotos : ['/van_demo.jpg'],
          onSiteInspectionCertUrl,
          fakePhotoDeclaration,
          vanAddress: `${businessName} Hub`
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

      <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-12">
        <div className="bg-white p-8 rounded-2xl border border-[#E5E1D8] shadow-md w-full space-y-8">
          
          {/* Onboarding Steps Progress Track */}
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-primary">Onboarding Credentials</h1>
              <p className="text-xs text-muted-foreground mt-1">Complete the mandatory verification phases before admin review.</p>
            </div>

            <div className="flex justify-between items-center max-w-md mx-auto relative pt-4 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E5E1D8]/60 -translate-y-1/2 -z-10"></div>
              {[
                { label: 'KYC', icon: ShieldCheck },
                { label: 'Business', icon: Landmark },
                { label: 'Vehicle', icon: Truck },
                { label: 'Verify', icon: FileText }
              ].map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 z-10 bg-white px-2">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-secondary border-secondary text-white' : 
                      isActive ? 'border-primary bg-primary/5 text-primary' : 
                      'border-[#E5E1D8] bg-white text-muted-foreground'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                    </div>
                    <span className={isActive ? 'text-primary font-extrabold' : 'text-slate-400'}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-secondary/15 text-secondary animate-bounce">
                <Check className="w-12 h-12" />
              </div>
              <h3 className="font-serif text-xl font-bold text-primary">Onboarding Request Submitted</h3>
              <p className="text-xs text-muted-foreground">
                Your partner details and vehicle records have been resubmitted successfully. Redirecting you to the status dashboard...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {error && (
                <div className="flex gap-2.5 items-start p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs leading-normal">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Views by Steps */}
              {currentStep === 1 && (
                <div className="space-y-4 text-xs text-primary animate-fadeIn">
                  <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-1">
                    <ShieldCheck className="w-5 h-5 text-secondary" /> Step 1: Personal KYC Verification
                  </h3>
                  <div className="space-y-4 bg-[#FCF9F6] border border-[#E5E1D8]/60 p-5 rounded-xl">
                    <div>
                      <label className="block font-semibold mb-1">Document Type *</label>
                      <select
                        value={kycDocType}
                        onChange={(e) => setKycDocType(e.target.value)}
                        className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                      >
                        <option value="ID_CARD">Aadhaar Card (National ID)</option>
                        <option value="PAN_CARD">PAN Card</option>
                        <option value="PASSPORT">Passport</option>
                        <option value="DRIVER_LICENSE">Driver's License</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Document Number / ID *</label>
                      <input
                        type="text"
                        required
                        value={kycDocNumber}
                        onChange={(e) => setKycDocNumber(e.target.value)}
                        className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                        placeholder="e.g. XXXX-XXXX-XXXX"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">Upload ID Document (PDF/Image) *</label>
                      <div className="relative border border-dashed border-[#E5E1D8] hover:border-secondary/40 rounded p-4 text-center cursor-pointer bg-white">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, 'kyc')}
                          disabled={isUploading !== null}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          {isUploading === 'kyc' ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-secondary" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span>Click to upload credentials proof</span>
                        </div>
                      </div>
                      {kycDocUrl && (
                        <div className="mt-2.5 flex items-center gap-2 text-[10px] text-secondary font-semibold bg-secondary/5 border border-secondary/15 p-2 rounded">
                          <Check className="w-4 h-4" />
                          <span className="truncate">Saved File: {kycDocUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 text-xs text-primary animate-fadeIn">
                  <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-1">
                    <Landmark className="w-5 h-5 text-secondary" /> Step 2: Business & Payout Validation
                  </h3>
                  <div className="space-y-4 bg-[#FCF9F6] border border-[#E5E1D8]/60 p-5 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-1">Business Name *</label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Registration / CIN Number *</label>
                        <input
                          type="text"
                          required
                          value={businessRegistrationNo}
                          onChange={(e) => setBusinessRegistrationNo(e.target.value)}
                          className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                          placeholder="CIN or Reg No"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-semibold mb-1">Business License No *</label>
                        <input
                          type="text"
                          required
                          value={businessLicenseNo}
                          onChange={(e) => setBusinessLicenseNo(e.target.value)}
                          className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">GST Number *</label>
                        <input
                          type="text"
                          required
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                          placeholder="GSTIN"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">PAN Number *</label>
                        <input
                          type="text"
                          required
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value)}
                          className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="border-t border-[#E5E1D8]/60 pt-3">
                      <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wide block mb-2">Payout Bank Account</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-semibold mb-1">Bank Name *</label>
                          <input
                            type="text"
                            required
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Account Number *</label>
                          <input
                            type="text"
                            required
                            value={bankAccountNumber}
                            onChange={(e) => setBankAccountNumber(e.target.value)}
                            className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">IFSC Code *</label>
                          <input
                            type="text"
                            required
                            value={bankIfsc}
                            onChange={(e) => setBankIfsc(e.target.value)}
                            className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#E5E1D8]/60 pt-3">
                      <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wide block mb-2">Driver Credentials</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold mb-1">Driver Name *</label>
                          <input
                            type="text"
                            required
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">License Number *</label>
                          <input
                            type="text"
                            required
                            value={driverLicenseNo}
                            onChange={(e) => setDriverLicenseNo(e.target.value)}
                            className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block font-semibold mb-2">Upload Driver ID/License Document *</label>
                        <div className="relative border border-dashed border-[#E5E1D8] hover:border-secondary/40 rounded p-4 text-center cursor-pointer bg-white">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileUpload(e, 'driverKyc')}
                            disabled={isUploading !== null}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex flex-col items-center gap-1 text-slate-400">
                            {isUploading === 'driverKyc' ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-secondary" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span>Click to upload driver license</span>
                          </div>
                        </div>
                        {driverKycUrl && (
                          <div className="mt-2.5 flex items-center gap-2 text-[10px] text-secondary font-semibold bg-secondary/5 border border-secondary/15 p-2 rounded">
                            <Check className="w-4 h-4" />
                            <span className="truncate">Saved File: {driverKycUrl}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 text-xs text-primary animate-fadeIn">
                  <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-1">
                    <Truck className="w-5 h-5 text-secondary" /> Step 3: Vehicle Parameters & Licenses
                  </h3>
                  <div className="space-y-4 bg-[#FCF9F6] border border-[#E5E1D8]/60 p-5 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-1">Vehicle Plate Number *</label>
                        <input
                          type="text"
                          required
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                          className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                          placeholder="e.g. MH-12-AB-1234"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Chassis Number *</label>
                        <input
                          type="text"
                          required
                          value={chassisNumber}
                          onChange={(e) => setChassisNumber(e.target.value)}
                          className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* RC Document */}
                        <div>
                          <label className="block font-semibold mb-1">Upload RC Book / Card *</label>
                          <div className="relative border border-dashed border-[#E5E1D8] hover:border-secondary/40 rounded p-3 text-center cursor-pointer bg-white">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileUpload(e, 'rc')}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <span className="text-[10px] text-slate-400 block truncate">
                              {isUploading === 'rc' ? 'Uploading...' : rcUrl ? '✓ Uploaded RC' : 'Upload RC'}
                            </span>
                          </div>
                        </div>

                        {/* Insurance Doc */}
                        <div>
                          <label className="block font-semibold mb-1">Upload Insurance Doc *</label>
                          <div className="relative border border-dashed border-[#E5E1D8] hover:border-secondary/40 rounded p-3 text-center cursor-pointer bg-white">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileUpload(e, 'insurance')}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <span className="text-[10px] text-slate-400 block truncate">
                              {isUploading === 'insurance' ? 'Uploading...' : insuranceUrl ? '✓ Uploaded Insurance' : 'Upload Insurance'}
                            </span>
                          </div>
                        </div>

                        {/* PUC Certificate */}
                        <div>
                          <label className="block font-semibold mb-1">Upload PUC Cert *</label>
                          <div className="relative border border-dashed border-[#E5E1D8] hover:border-secondary/40 rounded p-3 text-center cursor-pointer bg-white">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileUpload(e, 'puc')}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <span className="text-[10px] text-slate-400 block truncate">
                              {isUploading === 'puc' ? 'Uploading...' : pucUrl ? '✓ Uploaded PUC' : 'Upload PUC'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 p-3.5 bg-yellow-50/50 border border-yellow-200 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isCommercial}
                          onChange={(e) => setIsCommercial(e.target.checked)}
                          className="mt-0.5 rounded text-secondary focus:ring-secondary border-[#E5E1D8]"
                        />
                        <span className="leading-relaxed text-[11px] text-yellow-800">
                          Confirm this vehicle passes the **Commercial Passing** checklist (yellow-plated vehicle) and RC represents commercial operation permissions under local laws. Private passing is strictly prohibited.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4 text-xs text-primary animate-fadeIn">
                  <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-1">
                    <Sparkles className="w-5 h-5 text-secondary" /> Step 4: Sensory Pod Layout & Inspection
                  </h3>
                  <div className="space-y-4 bg-[#FCF9F6] border border-[#E5E1D8]/60 p-5 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-1">Van/Cabin Name *</label>
                        <input
                          type="text"
                          required
                          value={vanTitle}
                          onChange={(e) => setVanTitle(e.target.value)}
                          className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                          placeholder="e.g. Bandra Premium Calm Pod"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Price Tier (30 Min) *</label>
                        <input
                          type="number"
                          required
                          value={vanPrice30}
                          onChange={(e) => setVanPrice30(Number(e.target.value))}
                          className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Description *</label>
                      <textarea
                        rows={2}
                        required
                        value={vanDescription}
                        onChange={(e) => setVanDescription(e.target.value)}
                        className="w-full p-2 border border-[#E5E1D8] rounded bg-white font-medium font-sans resize-none"
                        placeholder="Detail comfort specifications..."
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">Amenities</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {availableAmenities.map((amenity) => (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => handleAmenityToggle(amenity)}
                            className={`p-2 rounded border text-center transition-all ${
                              vanAmenities.includes(amenity)
                                ? 'bg-secondary border-secondary text-white font-bold'
                                : 'bg-white border-[#E5E1D8] text-primary'
                            }`}
                          >
                            {amenity}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#E5E1D8]/60 pt-3">
                      {/* Photos uploads */}
                      <div>
                        <label className="block font-semibold mb-2">Upload Interior/Exterior Photos *</label>
                        <div className="relative border border-dashed border-[#E5E1D8] hover:border-secondary/40 rounded p-4 text-center cursor-pointer bg-white">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileUpload(e, 'photos')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="text-[10px] text-slate-400">
                            {isUploading === 'photos' ? 'Uploading...' : 'Upload Cabin Photos'}
                          </div>
                        </div>
                        {vanPhotos.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {vanPhotos.map((url, i) => (
                              <img key={i} src={url} className="w-10 h-10 object-cover rounded border border-[#E5E1D8]" alt="upload preview" />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* On-site inspection document */}
                      <div>
                        <label className="block font-semibold mb-2">Upload On-Sight Inspection Cert *</label>
                        <div className="relative border border-dashed border-[#E5E1D8] hover:border-secondary/40 rounded p-4 text-center cursor-pointer bg-white">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileUpload(e, 'inspection')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="text-[10px] text-slate-400">
                            {isUploading === 'inspection' ? 'Uploading...' : onSiteInspectionCertUrl ? '✓ Cert Uploaded' : 'Upload Inspection Cert'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#E5E1D8]/60">
                      <label className="flex items-start gap-2.5 p-3.5 bg-secondary/5 border border-secondary/15 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fakePhotoDeclaration}
                          onChange={(e) => setFakePhotoDeclaration(e.target.checked)}
                          className="mt-0.5 rounded text-secondary focus:ring-secondary border-[#E5E1D8]"
                        />
                        <span className="leading-relaxed text-[11px] text-[#2C5234]">
                          I declare that all vehicle and interior photos uploaded are authentic and belong strictly to this specific wellness vehicle. I understand that posting fake photos will result in immediate profile ban and platform blacklist.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="pt-4 border-t border-[#FAF8F5] flex justify-between gap-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 py-2.5 px-6 border border-[#E5E1D8] text-primary rounded-lg text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous Phase
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push('/vendor/dashboard')}
                    className="inline-flex items-center justify-center py-2.5 px-6 border border-[#E5E1D8] text-primary rounded-lg text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Cancel Onboarding
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 py-2.5 px-6 text-xs font-bold rounded-lg text-white bg-primary hover:bg-primary/95 shadow transition-all cursor-pointer"
                  >
                    Next Phase <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || isUploading !== null || !onSiteInspectionCertUrl || !fakePhotoDeclaration}
                    className="inline-flex items-center gap-1.5 py-2.5 px-6 text-xs font-bold rounded-lg text-white bg-secondary hover:bg-secondary/95 shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting Credentials...' : 'Submit Host Profile'}
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
