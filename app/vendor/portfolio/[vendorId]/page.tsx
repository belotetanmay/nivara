'use client';

import React, { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Star, MapPin, Sparkles, ShieldCheck, User, CheckCircle2 } from 'lucide-react';

interface Van {
  id: string;
  title: string;
  address: string;
  price30: number;
  amenities: string[];
  photos: string[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customer: {
    name: string;
  };
  van: {
    title: string;
  };
}

interface VendorProfile {
  businessName: string;
  bio: string;
  ratingAvg: number;
  totalBookings: number;
  verificationStatus: string;
  user: {
    name: string;
    createdAt: string;
  };
}

export default function VendorPortfolio({ params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = use(params);

  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [vans, setVans] = useState<Van[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`/api/vendor/portfolio/${vendorId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProfile(data.vendorProfile);
          setVans(data.vans || []);
          setReviews(data.reviews || []);
        } else {
          setError(data.error || 'Partner profile not found.');
        }
      } catch (err) {
        setError('Error retrieving partner portfolio.');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [vendorId]);

  const renderStars = (rating: number) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= floor ? 'text-[#D4A373] fill-[#D4A373]' : 'text-gray-200'
          }`}
        />
      );
    }
    return stars;
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

  if (error || !profile) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <div className="flex-grow max-w-3xl mx-auto w-full px-4 py-16 text-center space-y-4">
          <h1 className="font-serif text-2xl font-bold text-primary">Portfolio Error</h1>
          <p className="text-sm text-muted-foreground">{error || 'Host profile not found.'}</p>
          <div className="pt-2">
            <Link href="/customer/search" className="text-secondary font-semibold hover:underline">
              Back to Discover
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-12 sm:px-6">
        <div className="space-y-10">
          
          {/* Header Profile card */}
          <div className="bg-white border border-[#E5E1D8] p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#C19A6B_1px,transparent_1px)] [background-size:20px_20px] opacity-5"></div>
            
            <div className="space-y-3 z-10">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-3xl font-bold tracking-tight text-primary leading-tight">
                  {profile.businessName}
                </h1>
                {profile.verificationStatus === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/20 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Host Partner
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground font-sans">
                Host Operator: <span className="font-semibold text-primary">{profile.user.name}</span> | Registered since {new Date(profile.user.createdAt).getFullYear()}
              </p>

              <div className="flex items-center gap-4 text-xs font-semibold text-primary pt-1">
                <div className="flex items-center gap-1">
                  <span>Rating:</span>
                  <div className="flex items-center">{renderStars(profile.ratingAvg)}</div>
                  <span className="text-muted-foreground">({profile.ratingAvg > 0 ? profile.ratingAvg.toFixed(1) : 'No reviews'})</span>
                </div>
                <span>•</span>
                <span>Sessions Completed: {profile.totalBookings}</span>
              </div>
            </div>

            <div className="bg-[#FCF9F6] border border-[#E5E1D8] p-4 rounded-xl text-xs space-y-1.5 z-10 w-full md:w-auto text-center md:text-left">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Marketplace Status</span>
              <span className="font-bold text-secondary flex items-center justify-center md:justify-start gap-1">
                <CheckCircle2 className="w-4 h-4 text-secondary" /> Active Inventory Partner
              </span>
            </div>
          </div>

          {/* Biography Bio */}
          <div className="bg-white border border-[#E5E1D8] p-6 rounded-xl space-y-3 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-primary">About Host</h2>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans font-light whitespace-pre-line">
              {profile.bio || 'No biography details provided yet.'}
            </p>
          </div>

          {/* List of active vans fleet under this vendor */}
          <div className="space-y-5">
            <h2 className="font-serif text-2xl font-bold text-primary">wellness vehicle fleet</h2>

            {vans.length === 0 ? (
              <div className="bg-white border border-[#E5E1D8] rounded-xl p-12 text-center text-xs text-muted-foreground leading-relaxed">
                No active vans listed under this partner at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vans.map((van) => (
                  <div
                    key={van.id}
                    className="bg-white border border-[#E5E1D8] rounded-xl p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-all shadow-sm group"
                  >
                    {/* Visual Header / Photo */}
                    <div className="w-full h-36 rounded-lg border border-[#E5E1D8]/40 overflow-hidden relative">
                      <img
                        src={(van.photos && van.photos.length > 0 && !van.photos[0].startsWith('/images/')) ? van.photos[0] : "/van_demo.jpg"}
                        alt={van.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <h3 className="font-serif text-lg font-bold text-primary leading-tight group-hover:text-secondary transition-colors">
                          {van.title}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 leading-normal">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                          <span className="truncate max-w-sm">{van.address}</span>
                        </p>
                      </div>

                      {/* Amenities chips */}
                      <div className="flex flex-wrap gap-1">
                        {van.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="bg-[#FCF9F6] border border-[#E5E1D8]/65 text-[9px] font-medium text-primary px-2 py-0.5 rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                        {van.amenities.length > 3 && (
                          <span className="text-[9px] text-muted-foreground py-0.5 px-1 font-medium">
                            +{van.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#FAF8F5] flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[9px] text-muted-foreground block">Slots price</span>
                        <span className="font-bold text-primary">₹{van.price30} <span className="font-normal text-muted-foreground">/ 30 min</span></span>
                      </div>
                      <Link
                        href={`/customer/vans/${van.id}`}
                        className="py-2 px-4 rounded text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/95 transition-all shadow"
                      >
                        Reserve slot
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aggregated reviews */}
          <section className="bg-white border border-[#E5E1D8] rounded-xl p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-primary mb-6">Customer Reviews</h2>
            
            {reviews.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground leading-relaxed">
                No reviews have been written for this host partner fleet yet.
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-[#FAF8F5]">
                {reviews.map((review, i) => (
                  <div key={review.id} className={`space-y-2.5 ${i > 0 ? 'pt-6' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-primary">{review.customer.name}</span>
                          <span className="text-[10px] text-muted-foreground">reviewed</span>
                          <span className="text-[10px] font-bold text-secondary">{review.van.title}</span>
                        </div>
                        <div className="flex gap-1 mt-1">{renderStars(review.rating)}</div>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed italic font-light font-serif">
                      &quot;{review.comment}&quot;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
