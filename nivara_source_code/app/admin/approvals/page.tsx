'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, XCircle, FileText, Landmark, RefreshCw, Eye } from 'lucide-react';

interface KYCDocument {
  id: string;
  docType: string;
  docNumber: string;
  fileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason: string | null;
  reviewedAt: string | null;
  user: {
    name: string;
    email: string;
    kycStatus: string;
  };
}

interface Van {
  id: string;
  title: string;
  address: string;
  price30: number;
  status: 'UNDER_REVIEW' | 'ACTIVE' | 'INACTIVE';
  vehicleNumber: string | null;
  chassisNumber: string | null;
  insuranceUrl: string | null;
  pucUrl: string | null;
  rcUrl: string | null;
  isCommercial: boolean;
  onSiteInspectionCertUrl: string | null;
  fakePhotoDeclaration: boolean;
  photos: string[];
}

interface VendorProfile {
  id: string;
  businessName: string;
  bio: string;
  payoutDetails: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason: string | null;
  businessRegistrationNo: string | null;
  businessLicenseNo: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  driverName: string | null;
  driverLicenseNo: string | null;
  driverKycUrl: string | null;
  user: {
    name: string;
    email: string;
  };
  vans: Van[];
}

export default function AdminApprovals() {
  const [activeTab, setActiveTab] = useState<'kyc' | 'vendors'>('kyc');
  const [kycDocs, setKycDocs] = useState<KYCDocument[]>([]);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Actions states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null); // document or vendor profile id currently being rejected

  const fetchKycQueue = async () => {
    try {
      const res = await fetch('/api/admin/kyc');
      const data = await res.json();
      if (res.ok && data.success) {
        setKycDocs(data.documents || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVendorsQueue = async () => {
    try {
      const res = await fetch('/api/admin/vendors');
      const data = await res.json();
      if (res.ok && data.success) {
        setVendors(data.vendors || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (activeTab === 'kyc') {
      await fetchKycQueue();
    } else {
      await fetchVendorsQueue();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // KYC Actions
  const handleApproveKyc = async (docId: string) => {
    setProcessingId(docId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/kyc/${docId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Traveler identity verified successfully.');
        await fetchKycQueue();
      } else {
        setError(data.error || 'Failed to verify KYC.');
      }
    } catch (e) {
      setError('Error while approving document.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectKyc = async (docId: string) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason.');
      return;
    }

    setProcessingId(docId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/kyc/${docId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Identity document rejected. Notification logged.');
        setRejectingId(null);
        setRejectionReason('');
        await fetchKycQueue();
      } else {
        setError(data.error || 'Failed to reject KYC.');
      }
    } catch (e) {
      setError('Error while rejecting document.');
    } finally {
      setProcessingId(null);
    }
  };

  // Vendor Actions
  const handleApproveVendor = async (vendorId: string) => {
    setProcessingId(vendorId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Vendor profile verified successfully.');
        await fetchVendorsQueue();
      } else {
        setError(data.error || 'Failed to approve vendor.');
      }
    } catch (e) {
      setError('Error while approving partner profile.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectVendor = async (vendorId: string) => {
    if (!rejectionReason.trim()) {
      setError('Please specify rejection reason comments.');
      return;
    }

    setProcessingId(vendorId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Vendor host profile rejected and suspended.');
        setRejectingId(null);
        setRejectionReason('');
        await fetchVendorsQueue();
      } else {
        setError(data.error || 'Failed to reject vendor.');
      }
    } catch (e) {
      setError('Error while rejecting partner profile.');
    } finally {
      setProcessingId(null);
    }
  };

  // Van Actions
  const handleApproveVan = async (vanId: string) => {
    setProcessingId(vanId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/vans/${vanId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Wellness van listing approved and set active.');
        await fetchVendorsQueue();
      } else {
        setError(data.error || 'Failed to approve van.');
      }
    } catch (e) {
      setError('Error approving van.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectVan = async (vanId: string) => {
    if (!rejectionReason.trim()) {
      setError('Please provide comments for van rejection.');
      return;
    }

    setProcessingId(vanId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/vans/${vanId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Van listing rejected and set inactive.');
        setRejectingId(null);
        setRejectionReason('');
        await fetchVendorsQueue();
      } else {
        setError(data.error || 'Failed to reject van listing.');
      }
    } catch (e) {
      setError('Error rejecting van.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-secondary/15 text-secondary border border-secondary/20';
      case 'PENDING':
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'REJECTED':
      case 'SUSPENDED':
      case 'INACTIVE':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E1D8] pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">Verification Queues</h1>
          <p className="text-sm text-muted-foreground">Approve or reject customer identity submissions, vendor hosts onboarding, and listing vans.</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex gap-2.5 items-start p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm font-sans">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <div>{error}</div>
        </div>
      )}
      {success && (
        <div className="flex gap-2.5 items-start p-4 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm font-sans">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500 mt-0.5" />
          <div>{success}</div>
        </div>
      )}

      {/* Tabs bar */}
      <div className="flex border-b border-[#E5E1D8]">
        <button
          onClick={() => {
            setActiveTab('kyc');
            setRejectingId(null);
            setRejectionReason('');
          }}
          className={`pb-3 text-sm font-semibold border-b-2 px-6 transition-all ${
            activeTab === 'kyc'
              ? 'border-secondary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-primary'
          }`}
        >
          Traveler KYC reviews ({kycDocs.filter((d) => d.status === 'PENDING').length})
        </button>
        <button
          onClick={() => {
            setActiveTab('vendors');
            setRejectingId(null);
            setRejectionReason('');
          }}
          className={`pb-3 text-sm font-semibold border-b-2 px-6 transition-all ${
            activeTab === 'vendors'
              ? 'border-secondary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-primary'
          }`}
        >
          Host & Vans queues ({vendors.filter((v) => v.verificationStatus === 'PENDING').length + vendors.reduce((c, v) => c + v.vans.filter(van => van.status === 'UNDER_REVIEW').length, 0)})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        </div>
      ) : activeTab === 'kyc' ? (
        
        // KYC TAB VIEW
        <div className="space-y-6">
          <h3 className="font-serif text-lg font-bold text-primary">Pending Identity Reviews</h3>
          
          {kycDocs.filter((d) => d.status === 'PENDING').length === 0 ? (
            <p className="text-center py-8 text-xs text-muted-foreground border border-dashed border-[#E5E1D8] bg-white rounded-xl">
              No traveler KYC document submissions pending review.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {kycDocs.filter((d) => d.status === 'PENDING').map((doc) => (
                <div key={doc.id} className="bg-white border border-[#E5E1D8] rounded-xl p-5 space-y-4 text-xs text-primary shadow-sm">
                  
                  <div className="flex justify-between items-start border-b border-[#FAF8F5] pb-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Traveler</span>
                      <h4 className="font-bold text-primary text-sm mt-0.5">{doc.user.name} ({doc.user.email})</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getStatusBadge(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 leading-normal text-muted-foreground">
                    <div>
                      <span className="block font-semibold text-primary">Document Type:</span>
                      <span>{doc.docType}</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-primary">Document ID:</span>
                      <span>{doc.docNumber}</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-primary">Uploaded Proof:</span>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-secondary font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Upload Document
                      </a>
                    </div>
                  </div>

                  {rejectingId === doc.id ? (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-md space-y-3">
                      <label className="block text-[10px] font-bold text-red-800 uppercase tracking-wider">
                        Specify Rejection Reason (Customer will see this)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Identity photo is blurry, name does not match, etc..."
                        className="w-full p-2 border border-red-200 bg-white rounded text-xs focus:outline-none"
                        rows={2}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleRejectKyc(doc.id)}
                          className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason('');
                          }}
                          className="py-1 px-3 border border-red-200 text-red-700 bg-white rounded font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 pt-2 border-t border-[#FAF8F5]">
                      <button
                        onClick={() => handleApproveKyc(doc.id)}
                        disabled={processingId !== null}
                        className="py-1.5 px-4 bg-secondary hover:bg-secondary/95 text-primary-foreground font-bold rounded flex items-center justify-center gap-1.5"
                      >
                        Approve Identity
                      </button>
                      <button
                        onClick={() => setRejectingId(doc.id)}
                        disabled={processingId !== null}
                        className="py-1.5 px-4 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded"
                      >
                        Reject Submission
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

          {/* KYC History log */}
          <div className="pt-6 border-t border-[#E5E1D8] space-y-4">
            <h4 className="font-serif text-base font-bold text-primary">Identity Reviews History</h4>
            <div className="bg-white border border-[#E5E1D8] rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left font-sans text-primary">
                <thead>
                  <tr className="bg-[#FCF9F6] border-b border-[#E5E1D8] text-muted-foreground">
                    <th className="p-3 font-semibold">User</th>
                    <th className="p-3 font-semibold">Doc Type</th>
                    <th className="p-3 font-semibold">Reviewed At</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF8F5]">
                  {kycDocs.filter((d) => d.status !== 'PENDING').map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#FCF9F6]/20 transition-colors">
                      <td className="p-3">
                        <span className="font-semibold block">{doc.user.name}</span>
                        <span className="text-[10px] text-muted-foreground">{doc.user.email}</span>
                      </td>
                      <td className="p-3 font-medium">{doc.docType}</td>
                      <td className="p-3 text-muted-foreground">
                        {doc.reviewedAt ? new Date(doc.reviewedAt).toLocaleDateString() : 'System'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getStatusBadge(doc.status)}`}>
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        
        // VENDOR TAB VIEW
        <div className="space-y-8">
          
          {/* Section: Vendor Profiles */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-primary">Pending Host Partner Applications</h3>
            
            {vendors.filter((v) => v.verificationStatus === 'PENDING').length === 0 ? (
              <p className="text-center py-6 text-xs text-muted-foreground border border-dashed border-[#E5E1D8] bg-white rounded-xl">
                No partner onboarding requests pending review.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {vendors.filter((v) => v.verificationStatus === 'PENDING').map((vendor) => (
                  <div key={vendor.id} className="bg-white border border-[#E5E1D8] rounded-xl p-5 space-y-4 text-xs text-primary shadow-sm">
                    
                    <div className="flex justify-between items-start border-b border-[#FAF8F5] pb-3">
                      <div>
                        <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Business Portfolio</span>
                        <h4 className="font-bold text-primary text-sm mt-0.5">{vendor.businessName}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(vendor.verificationStatus)}`}>
                        {vendor.verificationStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground leading-normal border-b border-[#FAF8F5] pb-3">
                      <div>
                        <span className="font-semibold text-primary block">Owner Name:</span>
                        <span>{vendor.user.name} ({vendor.user.email})</span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary block">Payout Dest Bank Account:</span>
                        <span className="font-mono text-primary font-bold">
                          {vendor.bankName} • Acc: {vendor.bankAccountNumber} • IFSC: {vendor.bankIfsc}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-muted-foreground leading-normal border-b border-[#FAF8F5] pb-3">
                      <div>
                        <span className="font-semibold text-primary block">Business Reg No:</span>
                        <span className="font-mono text-primary">{vendor.businessRegistrationNo}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary block">GSTIN / License No:</span>
                        <span className="font-mono text-primary">{vendor.gstNumber} • {vendor.businessLicenseNo}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary block">PAN Card Number:</span>
                        <span className="font-mono text-primary">{vendor.panNumber}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground leading-normal border-b border-[#FAF8F5] pb-3 bg-secondary/5 p-3 rounded-lg border border-secondary/15">
                      <div>
                        <span className="font-semibold text-primary block">Staff Driver Name:</span>
                        <span>{vendor.driverName}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary block">Driver License No & Documents:</span>
                        <span className="font-mono text-primary block">{vendor.driverLicenseNo}</span>
                        {vendor.driverKycUrl && (
                          <a
                            href={vendor.driverKycUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-secondary hover:underline font-bold mt-1 inline-block"
                          >
                            📄 View Driver KYC Credentials Document
                          </a>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-primary block">Bio Biography:</span>
                      <p className="leading-relaxed font-sans italic mt-1 bg-[#FCF9F6] p-3 border rounded border-[#E5E1D8]/40">
                        {vendor.bio}
                      </p>
                    </div>

                    {rejectingId === vendor.id ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded space-y-3">
                        <label className="block text-[10px] font-bold text-red-800 uppercase tracking-wider">
                          Rejection Reason Comments
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g. Invalid bank credentials, invalid documents, etc..."
                          className="w-full p-2 border border-red-200 bg-white rounded text-xs focus:outline-none"
                          rows={2}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleRejectVendor(vendor.id)}
                            className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
                          >
                            Confirm Rejection
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason('');
                            }}
                            className="py-1 px-3 border border-red-200 text-red-700 bg-white rounded font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 pt-2 border-t border-[#FAF8F5]">
                        <button
                          onClick={() => handleApproveVendor(vendor.id)}
                          disabled={processingId !== null}
                          className="py-1.5 px-4 bg-secondary hover:bg-secondary/95 text-primary-foreground font-bold rounded flex items-center justify-center gap-1.5"
                        >
                          Approve Host
                        </button>
                        <button
                          onClick={() => setRejectingId(vendor.id)}
                          disabled={processingId !== null}
                          className="py-1.5 px-4 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded"
                        >
                          Reject Application
                        </button>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Van Listings Under Review */}
          <div className="space-y-4 pt-6 border-t border-[#E5E1D8]">
            <h3 className="font-serif text-lg font-bold text-primary">Pending Van Listing Reviews</h3>
            
            {vendors.reduce((c, v) => c + v.vans.filter(van => van.status === 'UNDER_REVIEW').length, 0) === 0 ? (
              <p className="text-center py-6 text-xs text-muted-foreground border border-dashed border-[#E5E1D8] bg-white rounded-xl">
                No wellness van listings pending review.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {vendors.map((vendor) => 
                  vendor.vans.filter(van => van.status === 'UNDER_REVIEW').map((van) => (
                    <div key={van.id} className="bg-white border border-[#E5E1D8] rounded-xl p-5 space-y-4 text-xs text-primary shadow-sm">
                      
                      <div className="flex justify-between items-start border-b border-[#FAF8F5] pb-3">
                        <div>
                          <span className="text-[10px] text-muted-foreground block uppercase font-bold">Host: {vendor.businessName}</span>
                          <h4 className="font-bold text-primary text-sm mt-0.5">{van.title}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getStatusBadge(van.status)}`}>
                          {van.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="leading-relaxed text-muted-foreground border-b border-[#FAF8F5] pb-3">
                        <span className="font-semibold text-primary block">Vehicle address:</span>
                        <span>{van.address}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-muted-foreground leading-normal border-b border-[#FAF8F5] pb-3">
                        <div>
                          <span className="font-semibold text-primary block">Vehicle Plate Number:</span>
                          <span className="font-mono text-primary font-bold">{van.vehicleNumber}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-primary block">Chassis Number:</span>
                          <span className="font-mono text-primary">{van.chassisNumber}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-primary block">Passing Classification:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${van.isCommercial ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'bg-red-50 text-red-600'}`}>
                            {van.isCommercial ? '⚠️ COMMERCIAL PASSING' : 'PRIVATE PASSING'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-muted-foreground leading-normal border-b border-[#FAF8F5] pb-3">
                        <div>
                          <span className="font-semibold text-primary block">RC Document Proof:</span>
                          {van.rcUrl ? (
                            <a href={van.rcUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-bold">
                              📄 View Registration Certificate (RC)
                            </a>
                          ) : <span className="text-red-500">Not Uploaded</span>}
                        </div>
                        <div>
                          <span className="font-semibold text-primary block">Vehicle Insurance:</span>
                          {van.insuranceUrl ? (
                            <a href={van.insuranceUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-bold">
                              📄 View Valid Insurance Document
                            </a>
                          ) : <span className="text-red-500">Not Uploaded</span>}
                        </div>
                        <div>
                          <span className="font-semibold text-primary block">PUC Emissions Cert:</span>
                          {van.pucUrl ? (
                            <a href={van.pucUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-bold">
                              📄 View Pollution (PUC) Cert
                            </a>
                          ) : <span className="text-red-500">Not Uploaded</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground leading-normal border-b border-[#FAF8F5] pb-3 bg-secondary/5 p-3 rounded-lg border border-secondary/15">
                        <div>
                          <span className="font-semibold text-primary block">On-Sight Inspection Cert:</span>
                          {van.onSiteInspectionCertUrl ? (
                            <a href={van.onSiteInspectionCertUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary hover:underline font-extrabold flex items-center gap-1 mt-0.5">
                              📋 View Certified Inspection Report
                            </a>
                          ) : <span className="text-red-500">Not Uploaded</span>}
                        </div>
                        <div>
                          <span className="font-semibold text-primary block">Photos Trust Declaration:</span>
                          <span className="font-semibold text-[#2C5234]">
                            {van.fakePhotoDeclaration ? '✓ Declared Original & Inspected (Verified)' : '❌ Not Declared'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-primary block mb-2">Uploaded Cabin Photos:</span>
                        <div className="flex flex-wrap gap-2">
                          {van.photos && van.photos.map((photo, i) => (
                            <a key={i} href={photo} target="_blank" rel="noopener noreferrer" className="border border-[#E5E1D8] rounded overflow-hidden">
                              <img src={photo.startsWith('/images/') ? '/van_demo.jpg' : photo} className="w-14 h-14 object-cover hover:opacity-80 transition-opacity" alt="preview" />
                            </a>
                          ))}
                        </div>
                      </div>

                      {rejectingId === van.id ? (
                        <div className="p-3 bg-red-50 border border-red-200 rounded space-y-3">
                          <label className="block text-[10px] font-bold text-red-800 uppercase tracking-wider">
                            Rejection Reason Comments
                          </label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Photos are missing, pricing is too high, invalid address geocode details..."
                            className="w-full p-2 border border-red-200 bg-white rounded text-xs"
                            rows={2}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleRejectVan(van.id)}
                              className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
                            >
                              Confirm Rejection
                            </button>
                            <button
                              onClick={() => {
                                setRejectingId(null);
                                setRejectionReason('');
                              }}
                              className="py-1 px-3 border border-red-200 text-red-700 bg-white rounded font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 pt-2 border-t border-[#FAF8F5]">
                          <button
                            onClick={() => handleApproveVan(van.id)}
                            disabled={processingId !== null}
                            className="py-1.5 px-4 bg-secondary hover:bg-secondary/95 text-primary-foreground font-bold rounded flex items-center justify-center gap-1.5"
                          >
                            Approve Van Listing
                          </button>
                          <button
                            onClick={() => setRejectingId(van.id)}
                            disabled={processingId !== null}
                            className="py-1.5 px-4 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded"
                          >
                            Reject Van Listing
                          </button>
                        </div>
                      )}

                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
