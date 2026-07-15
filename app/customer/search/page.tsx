'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Star, Sparkles, SlidersHorizontal, Navigation, ShieldCheck } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';

interface Van {
  id: string;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  price15: number;
  price30: number;
  price45: number;
  amenities: string[];
  photos: string[];
  hasAttendant: boolean;
  attendantName: string | null;
  distance?: number;
  vendor: {
    businessName: string;
    ratingAvg: number;
  };
}

export default function CustomerSearch() {
  const router = useRouter();
  const [addressInput, setAddressInput] = useState('');
  const [vans, setVans] = useState<Van[]>([]);
  const [loading, setLoading] = useState(true);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [gpsLocating, setGpsLocating] = useState(false);
  const [hoveredVanId, setHoveredVanId] = useState<string | null>(null);
  const [selectedVanForInfoWindow, setSelectedVanForInfoWindow] = useState<Van | null>(null);
  const [autocompleteInstance, setAutocompleteInstance] = useState<any>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasRealKey = !!(apiKey && !apiKey.includes('Mock') && !apiKey.startsWith('AIzaSyMock'));

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places'] as any,
  });

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Browser geolocation is not supported on this device.');
      return;
    }
    setGpsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        setLat(uLat);
        setLng(uLng);
        setAddressInput(`${uLat.toFixed(4)}, ${uLng.toFixed(4)}`);
        fetchVans(uLat, uLng);
        setGpsLocating(false);
      },
      (err) => {
        console.error('Browser Geolocation error:', err);
        alert('Could not locate your position. Please check your browser permissions.');
        setGpsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Automatically request geolocation permission only on discovery search page load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const uLat = position.coords.latitude;
          const uLng = position.coords.longitude;
          setLat(uLat);
          setLng(uLng);
          setAddressInput(`${uLat.toFixed(4)}, ${uLng.toFixed(4)}`);
          fetchVans(uLat, uLng);
        },
        (err) => {
          console.log('Location permission denied/unavailable. Falling back to manual search input options.');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const onAutocompleteLoad = (instance: any) => {
    setAutocompleteInstance(instance);
  };

  const onPlaceChanged = () => {
    if (autocompleteInstance) {
      const place = autocompleteInstance.getPlace();
      if (place.geometry?.location) {
        const nLat = place.geometry.location.lat();
        const nLng = place.geometry.location.lng();
        const formattedAddress = place.formatted_address || place.name || '';
        setAddressInput(formattedAddress);
        setLat(nLat);
        setLng(nLng);
        fetchVans(nLat, nLng);
      }
    }
  };

  // Filter States
  const [radius, setRadius] = useState<number>(10);
  const [maxPrice, setMaxPrice] = useState<string>('Any');
  const [hasAttendant, setHasAttendant] = useState<boolean>(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const amenitiesList = [
    'Zero-Gravity Chair',
    'Soundproofing',
    'Aromatherapy',
    'Ambient Lighting',
    'Air Conditioning',
    'Oxygen Therapy',
  ];

  const fetchVans = async (latitude?: number | null, longitude?: number | null) => {
    setLoading(true);
    try {
      let url = '/api/customer/vans?';
      if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
        url += `lat=${latitude}&lng=${longitude}&radius=${radius}&`;
      }
      if (maxPrice !== 'Any') {
        url += `maxPrice=${maxPrice}&`;
      }
      if (hasAttendant) {
        url += `hasAttendant=true&`;
      }
      if (selectedAmenities.length > 0) {
        url += `amenities=${encodeURIComponent(selectedAmenities.join(','))}&`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setVans(data.vans || []);
      }
    } catch (error) {
      console.error('Error fetching vans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch (gets all active vans)
    fetchVans(null, null);
  }, [radius, maxPrice, hasAttendant, selectedAmenities]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) {
      setLat(null);
      setLng(null);
      fetchVans(null, null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/customer/geocode?address=${encodeURIComponent(addressInput)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.lat && data.lng) {
          setLat(data.lat);
          setLng(data.lng);
          fetchVans(data.lat, data.lng);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= floor ? 'text-[#D4A373] fill-[#D4A373]' : i - 0.5 <= rating ? 'text-[#D4A373] fill-[#D4A373]/50' : 'text-gray-200'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          
          {/* Top Search bar */}
          <div className="bg-white border border-[#E5E1D8] p-6 rounded-xl shadow-sm space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow flex gap-2">
                <div className="relative flex-grow">
                  <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-muted-foreground z-10" />
                  {isLoaded && hasRealKey ? (
                    <Autocomplete
                      onLoad={onAutocompleteLoad}
                      onPlaceChanged={onPlaceChanged}
                    >
                      <input
                        type="text"
                        placeholder="Search city or area (e.g. Bandra, Thane West)..."
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-[#E5E1D8] rounded-md text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      type="text"
                      placeholder="Search city or area (e.g. Bandra, Thane West)..."
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-[#E5E1D8] rounded-md text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLocateUser}
                  disabled={gpsLocating}
                  title="Locate Me (GPS)"
                  className="p-3 rounded-md border border-[#E5E1D8] bg-[#FCF9F6] text-primary hover:bg-gray-50 hover:text-secondary transition-all flex items-center justify-center flex-shrink-0"
                >
                  <Navigation className={`w-5 h-5 ${gpsLocating ? 'animate-spin text-secondary' : ''}`} />
                </button>
              </div>
              <button
                type="submit"
                className="py-3 px-6 rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> Search Pods
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="py-3 px-4 rounded-md border border-[#E5E1D8] bg-[#FCF9F6] text-primary font-semibold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </form>

            {/* Filter Drawer */}
            {showFilters && (
              <div className="pt-4 border-t border-[#FAF8F5] grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-primary">
                
                {/* Distance and Price */}
                <div className="space-y-4">
                  {lat && lng && (
                    <div>
                      <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Search Radius (km)
                      </label>
                      <select
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="w-full p-2 border border-[#E5E1D8] rounded-md bg-white focus:outline-none"
                      >
                        <option value={5}>Within 5 km</option>
                        <option value={10}>Within 10 km</option>
                        <option value={20}>Within 20 km</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Max Price per Session (30 min)
                    </label>
                    <select
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full p-2 border border-[#E5E1D8] rounded-md bg-white focus:outline-none"
                    >
                      <option value="Any">Any Price</option>
                      <option value="300">Under ₹300</option>
                      <option value="500">Under ₹500</option>
                      <option value="700">Under ₹700</option>
                    </select>
                  </div>
                </div>

                {/* Amenities checklist */}
                <div className="md:col-span-2 space-y-3">
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground">
                    Required Cabin Features
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {amenitiesList.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 p-2 border border-[#E5E1D8] rounded-md bg-[#FCF9F6]/40 cursor-pointer hover:bg-gray-50 transition-all select-none"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="accent-secondary h-3.5 w-3.5 rounded border-gray-300"
                        />
                        <span className="truncate">{amenity}</span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-primary">
                      <input
                        type="checkbox"
                        checked={hasAttendant}
                        onChange={(e) => setHasAttendant(e.target.checked)}
                        className="accent-secondary h-4 w-4 rounded border-gray-300"
                      />
                      <span>Only Show Attended Vans (Attendant Present)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left list panel */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex justify-between items-center text-xs text-muted-foreground pb-2 border-b border-[#E5E1D8]">
                <span>
                  {loading ? 'Finding pods...' : `${vans.length} wellness pods available`}
                </span>
                {lat && lng && (
                  <span className="flex items-center gap-1 text-secondary font-medium">
                    <Navigation className="w-3.5 h-3.5" /> Filtering near geocenter
                  </span>
                )}
              </div>

              {loading ? (
                // Skeleton loading
                [1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-[#E5E1D8] rounded-xl p-5 animate-pulse flex gap-4 h-36">
                    <div className="w-24 h-full bg-gray-100 rounded-lg flex-shrink-0"></div>
                    <div className="flex-grow space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : vans.length === 0 ? (
                // Empty state
                <div className="bg-white border border-[#E5E1D8] rounded-xl p-12 text-center space-y-4 shadow-sm">
                  <h3 className="font-serif text-xl font-bold text-primary">No wellness pods found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    We couldn&apos;t find any active wellness vans matching your exact filters in this radius. Try expanding your search radius, selecting fewer amenities, or exploring alternative locations (e.g. Indiranagar, Bengaluru).
                  </p>
                  <button
                    onClick={() => {
                      setAddressInput('');
                      setLat(null);
                      setLng(null);
                      setMaxPrice('Any');
                      setHasAttendant(false);
                      setSelectedAmenities([]);
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 border border-[#E5E1D8] bg-[#FCF9F6] text-primary text-xs font-semibold rounded hover:bg-gray-50 transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                // Real results list
                vans.map((van) => (
                  <div
                    key={van.id}
                    onMouseEnter={() => setHoveredVanId(van.id)}
                    onMouseLeave={() => setHoveredVanId(null)}
                    className={`bg-white border rounded-xl p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-all shadow-sm group ${
                      hoveredVanId === van.id ? 'border-secondary ring-1 ring-secondary' : 'border-[#E5E1D8]'
                    }`}
                  >
                    {/* Visual Placeholder */}
                    <div className="w-full sm:w-28 h-28 bg-gradient-to-br from-[#2C5234]/15 to-[#0A2540]/10 rounded-lg flex-shrink-0 flex items-center justify-center border border-[#E5E1D8]/40">
                      <div className="text-center p-2 text-[10px] font-semibold text-secondary flex flex-col items-center">
                        <Sparkles className="w-5 h-5 mb-1" />
                        <span>Nivara Cabin</span>
                      </div>
                    </div>

                    {/* Details content */}
                    <div className="flex-grow flex flex-col justify-between space-y-3 sm:space-y-0">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-serif text-lg font-bold text-primary group-hover:text-secondary transition-colors">
                            {van.title}
                          </h3>
                          {van.distance !== undefined && (
                            <span className="text-[10px] bg-secondary/15 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full font-bold">
                              {van.distance.toFixed(1)} km away
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 leading-normal">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                          <span className="truncate max-w-sm sm:max-w-md">{van.address}</span>
                        </p>
                      </div>

                      {/* Amenities chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {van.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="bg-[#FCF9F6] border border-[#E5E1D8] text-[9px] font-medium text-primary px-2 py-0.5 rounded"
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

                      {/* Rating & Pricing Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#FAF8F5]">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center">{renderStars(van.vendor.ratingAvg)}</div>
                          <span className="text-[11px] text-muted-foreground font-semibold">
                            {van.vendor.ratingAvg > 0 ? van.vendor.ratingAvg.toFixed(1) : 'No reviews'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground block">30 Min Session</span>
                            <span className="font-bold text-primary text-sm">₹{van.price30}</span>
                          </div>
                          <Link
                            href={`/customer/vans/${van.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-bold rounded text-primary-foreground bg-primary hover:bg-primary/95 transition-all shadow"
                          >
                            View Slots
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Map Panel Placeholder (custom styled map list) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
              <div className="bg-[#EAE6DF] border border-[#E5E1D8] rounded-xl p-6 h-[480px] flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary tracking-wide">Vehicle Map View</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Visual layout of active wellness vehicle coordinates.
                  </p>
                </div>

                {/* Map Grid Canvas */}
                <div className="flex-grow bg-white border border-[#E5E1D8] rounded-lg my-4 relative overflow-hidden flex items-center justify-center">
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                  ) : vans.length === 0 ? (
                    <span className="text-xs text-muted-foreground font-medium text-center">No active vehicles on map</span>
                  ) : isLoaded && hasRealKey ? (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '8px' }}
                      zoom={11}
                      center={lat && lng ? { lat, lng } : { lat: 19.0760, lng: 72.8777 }}
                      options={{
                        disableDefaultUI: false,
                        zoomControl: true,
                        styles: [
                          {
                            "featureType": "all",
                            "elementType": "geometry.fill",
                            "stylers": [{ "weight": "2.00" }]
                          },
                          {
                            "featureType": "all",
                            "elementType": "geometry.stroke",
                            "stylers": [{ "color": "#E5E1D8" }]
                          },
                          {
                            "featureType": "landscape",
                            "elementType": "all",
                            "stylers": [{ "color": "#faf8f5" }]
                          },
                          {
                            "featureType": "water",
                            "elementType": "all",
                            "stylers": [{ "color": "#e0ecf8" }]
                          }
                        ]
                      }}
                    >
                      {vans.map(van => {
                        const vanLat = van.currentLatitude || van.latitude;
                        const vanLng = van.currentLongitude || van.longitude;
                        if (!vanLat || !vanLng) return null;
                        const isHovered = hoveredVanId === van.id;

                        return (
                          <React.Fragment key={van.id}>
                            <Marker
                              position={{ lat: vanLat, lng: vanLng }}
                              onClick={() => {
                                setSelectedVanForInfoWindow(van);
                              }}
                              onMouseOver={() => setHoveredVanId(van.id)}
                              onMouseOut={() => setHoveredVanId(null)}
                              options={{
                                icon: {
                                  path: typeof window !== 'undefined' ? (window as any).google?.maps?.SymbolPath?.CIRCLE : 0,
                                  scale: isHovered ? 13 : 9,
                                  fillColor: isHovered ? '#D4A373' : (van.currentLatitude ? '#2C5234' : '#0A2540'),
                                  fillOpacity: 1,
                                  strokeColor: '#ffffff',
                                  strokeWeight: 2,
                                }
                              }}
                            />
                            {selectedVanForInfoWindow?.id === van.id && (
                              <InfoWindow
                                position={{ lat: vanLat, lng: vanLng }}
                                onCloseClick={() => setSelectedVanForInfoWindow(null)}
                              >
                                <div style={{ fontFamily: 'Inter, sans-serif', padding: '6px', maxWidth: '220px', lineHeight: '1.4' }} className="text-primary">
                                  <h4 style={{ fontWeight: 700, margin: '0 0 2px 0', color: '#0A2540', fontSize: '13px' }}>{van.title}</h4>
                                  <p style={{ fontSize: '11px', color: '#666', margin: '0 0 6px 0' }}>{van.address}</p>
                                  {van.currentLatitude && <span style={{ display: 'inline-block', backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', marginBottom: '6px' }}>⚡ Live GPS Tracking</span>}
                                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#2C5234', marginBottom: '6px' }}>Price: from ₹{van.price15}/slot</div>
                                  <Link
                                    href={`/customer/vans/${van.id}`}
                                    style={{ display: 'inline-block', backgroundColor: '#0A2540', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', textDecoration: 'none' }}
                                  >
                                    View Slots
                                  </Link>
                                </div>
                              </InfoWindow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </GoogleMap>
                  ) : (
                    <div className="w-full h-full relative p-4 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(#C19A6B_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
                      <div className="w-full h-full relative">
                        {/* Render mock pins */}
                        {vans.map((van, index) => (
                          <div
                            key={van.id}
                            style={{
                              top: `${30 + (index * 20) % 50}%`,
                              left: `${20 + (index * 25) % 65}%`,
                            }}
                            className="absolute flex flex-col items-center group cursor-pointer"
                          >
                            <div className="flex items-center gap-1 bg-[#2C5234] text-white px-2 py-0.5 rounded shadow-md text-[9px] font-bold border border-white/20">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>₹{van.price30}</span>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-[#2C5234] border border-white mt-0.5 shadow-sm"></div>
                          </div>
                        ))}

                        {/* Map info watermark */}
                        <div className="absolute bottom-2 left-2 right-2 bg-[#FAF8F5]/90 backdrop-blur-sm border border-[#E5E1D8] p-2 rounded text-[10px] text-muted-foreground flex justify-between items-center font-medium">
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-secondary animate-pulse" />
                            <span>Google Maps Sandbox (Key Missing)</span>
                          </span>
                          <span>{vans.length} Vehicles Pinpoints</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-muted-foreground leading-normal font-sans">
                  * Powered by Google Maps Platform. Requires `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to render live dynamic coordinates search.
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
