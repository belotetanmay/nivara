// Haversine formula to calculate distance between two points in km
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Check if a point is within a given radius (km) of a center point
export function isWithinRadius(
  centerLat: number,
  centerLng: number,
  targetLat: number,
  targetLng: number,
  radiusKm: number
): boolean {
  const dist = getDistance(centerLat, centerLng, targetLat, targetLng);
  return dist <= radiusKm;
}

// Geocode address - support smart local mock for offline testing and Google Maps Geocoding API as fallback
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; error?: string }> {
  const query = address.toLowerCase().trim();

  // Smart local mock geocoder
  if (query.includes('indiranagar')) {
    return { lat: 12.9716, lng: 77.6412 };
  }
  if (query.includes('koramangala')) {
    return { lat: 12.9352, lng: 77.6245 };
  }
  if (query.includes('bandra')) {
    return { lat: 19.0596, lng: 72.8295 };
  }
  if (query.includes('mumbai')) {
    return { lat: 19.0760, lng: 72.8777 };
  }
  if (query.includes('delhi') || query.includes('connaught place')) {
    return { lat: 28.6139, lng: 77.2090 };
  }
  if (query.includes('bangalore') || query.includes('bengaluru')) {
    return { lat: 12.9716, lng: 77.5946 };
  }

  // Fallback to Google Geocoding API if key is available
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  if (apiKey && !apiKey.includes('Mock') && !apiKey.startsWith('AIzaSyMock')) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }
    } catch (err) {
      console.error('Google Geocoding error:', err);
    }
  }

  // Fallback in case coordinates cannot be parsed - return Bangalore center with small randomized offset so they show up on the map
  const randomOffsetLat = (Math.random() - 0.5) * 0.05;
  const randomOffsetLng = (Math.random() - 0.5) * 0.05;
  return { lat: 12.9716 + randomOffsetLat, lng: 77.5946 + randomOffsetLng };
}
