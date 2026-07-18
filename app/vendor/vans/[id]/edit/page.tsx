'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChevronLeft, MapPin, Upload, AlertCircle, RefreshCw } from 'lucide-react';

export default function EditVanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [serviceRadius, setServiceRadius] = useState('5');
  
  // Pricing states
  const [price15, setPrice15] = useState('');
  const [price30, setPrice30] = useState('');
  const [price45, setPrice45] = useState('');
  
  // Amenities & Attendant
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [hasAttendant, setHasAttendant] = useState(false);
  const [attendantName, setAttendantName] = useState('');
  
  // Photos array
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Page UI State
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amenitiesList = [
    'Zero-Gravity Chair',
    'Soundproofing',
    'Aromatherapy',
    'Ambient Lighting',
    'Air Conditioning',
    'Oxygen Therapy',
    'Calming Audio',
  ];

  useEffect(() => {
    const fetchVanDetails = async () => {
      try {
        const res = await fetch(`/api/vendor/vans/${id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          const v = data.van;
          setTitle(v.title);
          setDescription(v.description);
          setAddress(v.address);
          setServiceRadius(String(v.serviceRadius));
          setPrice15(String(v.price15));
          setPrice30(String(v.price30));
          setPrice45(String(v.price45));
          setSelectedAmenities(v.amenities || []);
          setHasAttendant(v.hasAttendant);
          setAttendantName(v.attendantName || '');
          setPhotos(v.photos || []);
        } else {
          setError(data.error || 'Failed to load van details.');
        }
      } catch (err) {
        setError('Error fetching van details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVanDetails();
  }, [id]);

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPhotos([...photos, data.fileUrl]);
      } else {
        setError(data.error || 'Failed to upload photo.');
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

    if (!title || !description || !address || !price15 || !price30 || !price45) {
      setError('Please fill in all required fields.');
      return;
    }

    if (hasAttendant && !attendantName) {
      setError('Please specify the attendant name if an attendant is present.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/vendor/vans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          address,
          serviceRadius: parseFloat(serviceRadius),
          price15: parseFloat(price15),
          price30: parseFloat(price30),
          price45: parseFloat(price45),
          amenities: selectedAmenities,
          photos,
          hasAttendant,
          attendantName: hasAttendant ? attendantName : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/vendor/vans');
      } else {
        setError(data.error || 'Failed to update van listing.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An error occurred while updating listing.');
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

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-12 sm:px-6">
        <div className="space-y-6">
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/vendor/vans" className="hover:text-primary transition-colors flex items-center gap-1 text-xs font-semibold">
              <ChevronLeft className="w-4.5 h-4.5" /> Back to fleet list
            </Link>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E1D8] shadow-md space-y-6">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-primary">Edit Van Listing</h1>
              <p className="text-xs text-muted-foreground mt-1">Make modifications to your registered wellness pod details.</p>
            </div>

            {error && (
              <div className="flex gap-2.5 items-start p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 text-xs text-primary">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Form side */}
                <div className="space-y-4">
                  <h3 className="font-serif text-base font-bold text-primary border-b border-[#FAF8F5] pb-2">Cabin Information</h3>
                  
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-xs font-semibold text-primary mb-1">
                      Van / Cabin Listing Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E1D8] rounded text-xs focus:outline-none focus:border-secondary"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-xs font-semibold text-primary mb-1">
                      Cabin Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E1D8] rounded text-xs focus:outline-none focus:border-secondary resize-none font-sans"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-xs font-semibold text-primary mb-1">
                      Current Base Address / Parking Spot <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 w-4.5 h-4.5 text-muted-foreground" />
                      <input
                        id="address"
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-[#E5E1D8] rounded text-xs focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  {/* Service Radius */}
                  <div>
                    <label htmlFor="radius" className="block text-xs font-semibold text-primary mb-1">
                      Active Service Search Radius (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="radius"
                      type="number"
                      required
                      min="1"
                      value={serviceRadius}
                      onChange={(e) => setServiceRadius(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E1D8] rounded text-xs focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>

                {/* Right Form side */}
                <div className="space-y-4">
                  <h3 className="font-serif text-base font-bold text-primary border-b border-[#FAF8F5] pb-2">Pricing & Attendant Settings</h3>

                  {/* Pricing grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="price15" className="block text-[10px] font-semibold text-primary mb-1">
                        30 Min Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="price15"
                        type="number"
                        required
                        value={price15}
                        onChange={(e) => setPrice15(e.target.value)}
                        className="w-full px-2 py-2 border border-[#E5E1D8] rounded text-xs focus:outline-none focus:border-secondary text-center"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="price30" className="block text-[10px] font-semibold text-primary mb-1">
                        45 Min Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="price30"
                        type="number"
                        required
                        value={price30}
                        onChange={(e) => setPrice30(e.target.value)}
                        className="w-full px-2 py-2 border border-[#E5E1D8] rounded text-xs focus:outline-none focus:border-secondary text-center"
                      />
                    </div>

                    <div>
                      <label htmlFor="price45" className="block text-[10px] font-semibold text-primary mb-1">
                        60 Min Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="price45"
                        type="number"
                        required
                        value={price45}
                        onChange={(e) => setPrice45(e.target.value)}
                        className="w-full px-2 py-2 border border-[#E5E1D8] rounded text-xs focus:outline-none focus:border-secondary text-center"
                      />
                    </div>
                  </div>

                  {/* Attendant Checkbox */}
                  <div className="p-3 bg-[#FCF9F6] border border-[#E5E1D8]/60 rounded-lg space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-primary">
                      <input
                        type="checkbox"
                        checked={hasAttendant}
                        onChange={(e) => setHasAttendant(e.target.checked)}
                        className="accent-secondary h-4 w-4"
                      />
                      <span>A Dedicated Staff Attendant is inside this van</span>
                    </label>

                    {hasAttendant && (
                      <div>
                        <label htmlFor="attendantName" className="block text-[10px] font-semibold text-primary mb-1">
                          Attendant Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="attendantName"
                          type="text"
                          required={hasAttendant}
                          value={attendantName}
                          onChange={(e) => setAttendantName(e.target.value)}
                          className="w-full px-2 py-1.5 border border-[#E5E1D8] bg-white rounded text-xs focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Photos Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-2">
                      Upload Vehicle / Cabin Photos (Optional)
                    </label>
                    <div className="relative border border-dashed border-[#E5E1D8] hover:border-secondary/40 rounded p-4 text-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-1 text-[11px] text-muted-foreground">
                        {isUploading ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-secondary" />
                        ) : (
                          <Upload className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span>Click to add listing photos</span>
                      </div>
                    </div>

                    {photos.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {photos.map((p, idx) => (
                          <div key={idx} className="bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded text-[10px] font-medium text-secondary">
                            Photo {idx + 1}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Amenities Grid */}
              <div className="space-y-2.5 pt-4 border-t border-[#FAF8F5]">
                <label className="block text-xs font-semibold text-primary">
                  Cabin Recovery Features (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {amenitiesList.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 p-2 border border-[#E5E1D8] rounded bg-[#FCF9F6]/20 hover:bg-gray-50 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="accent-secondary h-3.5 w-3.5"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel actions */}
              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex-grow py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all disabled:opacity-55 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Listing Details'}
                </button>
                <Link
                  href="/vendor/vans"
                  className="py-3 px-6 border border-[#E5E1D8] text-primary rounded-md text-sm hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </Link>
              </div>

            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
