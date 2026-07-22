'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Sparkles, MapPin, Edit, RefreshCw, AlertTriangle, Plus, ShieldCheck } from 'lucide-react';

interface Van {
  id: string;
  title: string;
  description: string;
  address: string;
  price15: number;
  price30: number;
  price45: number;
  amenities: string[];
  status: 'UNDER_REVIEW' | 'ACTIVE' | 'INACTIVE';
  hasAttendant: boolean;
  attendantName: string | null;
  photos: string[];
}

export default function VendorVans() {
  const [vans, setVans] = useState<Van[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchVans = async () => {
    try {
      const res = await fetch('/api/vendor/vans');
      const data = await res.json();
      if (res.ok && data.success) {
        setVans(data.vans || []);
      } else {
        setError(data.error || 'Failed to retrieve vans list.');
      }
    } catch (e) {
      setError('An error occurred loading vans fleet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVans();
  }, []);

  const handleToggleStatus = async (vanId: string) => {
    setTogglingId(vanId);
    setError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/vendor/vans/${vanId}/status`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.message || 'Van listing status updated successfully.');
        await fetchVans();
      } else {
        setError(data.error === 'VENDOR_NOT_APPROVED' 
          ? 'Host Status Action Blocked: Your host partner profile must be vetted and APPROVED by admin officers before toggling listings active.'
          : data.error || 'Failed to update van status.'
        );
      }
    } catch (err) {
      setError('Error updating listing status.');
    } finally {
      setTogglingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-secondary/15 text-secondary border border-secondary/20';
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-600 border border-gray-200';
      default:
        return 'bg-gray-50 text-gray-500';
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

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E1D8] pb-6">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">Cabins Fleet</h1>
              <p className="text-sm text-muted-foreground">Manage your mobile recovery vans listings and active states.</p>
            </div>
            
            <Link
              href="/vendor/vans/new"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Wellness Van
            </Link>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="flex gap-2.5 items-start p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div>{error}</div>
            </div>
          )}
          {actionSuccess && (
            <div className="flex gap-2.5 items-start p-4 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-green-500 mt-0.5" />
              <div>{actionSuccess}</div>
            </div>
          )}

          {/* Vans Fleet Grid */}
          {vans.length === 0 ? (
            <div className="bg-white border border-[#E5E1D8] rounded-xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#FCF9F6] flex items-center justify-center mx-auto text-muted-foreground">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-primary">No vehicles listed</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                You have not registered any wellness vehicles. Add your first van profile to submit it for administrator verification.
              </p>
              <div className="pt-2">
                <Link
                  href="/vendor/vans/new"
                  className="inline-flex items-center justify-center px-4 py-2 border border-[#E5E1D8] bg-[#FCF9F6] text-primary text-xs font-semibold rounded hover:bg-gray-50 transition-all gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Your First Van
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vans.map((van) => (
                <div
                  key={van.id}
                  className="bg-white rounded-xl border border-[#E5E1D8] shadow-sm flex flex-col hover:shadow-md transition-all group"
                >
                  {/* Visual Header / Photo */}
                  <div className="w-full h-36 rounded-t-xl overflow-hidden relative">
                    <img
                      src={(van.photos && van.photos.length > 0 && !van.photos[0].startsWith('/images/')) ? van.photos[0] : "/van_demo.jpg"}
                      alt={van.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Visual Header */}
                  <div className="p-5 border-b border-[#FAF8F5] flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary">{van.title}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-xs">{van.address}</span>
                      </p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(van.status)}`}>
                      {van.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-grow space-y-4 text-xs text-primary leading-relaxed">
                    <p className="text-muted-foreground font-sans font-light leading-relaxed line-clamp-2">
                      {van.description}
                    </p>

                    {/* Pricing Tiers grid */}
                    <div className="bg-[#FCF9F6] border border-[#E5E1D8]/65 p-3 rounded-lg grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase font-semibold">30 Min</span>
                        <span className="block font-bold text-primary text-sm mt-0.5">₹{van.price15}</span>
                      </div>
                      <div className="border-l border-r border-[#E5E1D8]/80">
                        <span className="text-[9px] text-muted-foreground uppercase font-semibold">45 Min</span>
                        <span className="block font-bold text-primary text-sm mt-0.5">₹{van.price30}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase font-semibold">60 Min</span>
                        <span className="block font-bold text-primary text-sm mt-0.5">₹{van.price45}</span>
                      </div>
                    </div>

                    {/* Amenities chips */}
                    <div className="flex flex-wrap gap-1">
                      {van.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="bg-[#FCF9F6] border border-[#E5E1D8]/60 text-[9px] font-medium text-primary px-2 py-0.5 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    {van.hasAttendant && (
                      <div className="text-[10px] text-muted-foreground flex justify-between bg-secondary/5 border border-secondary/15 px-2 py-1 rounded">
                        <span>Staff Attendant:</span>
                        <span className="font-semibold text-primary">{van.attendantName}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="p-5 border-t border-[#FAF8F5] bg-[#FCF9F6]/30 rounded-b-xl flex gap-3">
                    <Link
                      href={`/vendor/vans/${van.id}/edit`}
                      className="flex-grow py-2 border border-[#E5E1D8] bg-white hover:bg-gray-50 text-primary text-xs font-semibold rounded transition-all text-center flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Details
                    </Link>

                    {van.status !== 'UNDER_REVIEW' && (
                      <button
                        onClick={() => handleToggleStatus(van.id)}
                        disabled={togglingId === van.id}
                        className={`flex-grow py-2 text-xs font-semibold rounded border transition-all text-center flex items-center justify-center gap-1 ${
                          van.status === 'ACTIVE'
                            ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            : 'border-secondary/20 bg-secondary text-primary-foreground hover:bg-secondary/95 shadow-sm'
                        }`}
                      >
                        {togglingId === van.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : van.status === 'ACTIVE' ? (
                          'Set Inactive'
                        ) : (
                          'Go Active'
                        )}
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
