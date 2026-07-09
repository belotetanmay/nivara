import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VanStatus } from '@prisma/client';
import { getDistance } from '@/lib/services/location';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radius');
    const maxPrice = searchParams.get('maxPrice');
    const amenitiesParam = searchParams.get('amenities');
    const hasAttendant = searchParams.get('hasAttendant');

    // Retrieve active vans
    const vans = await db.van.findMany({
      where: {
        status: VanStatus.ACTIVE,
      },
      include: {
        vendor: {
          select: {
            businessName: true,
            ratingAvg: true,
            verificationStatus: true,
          },
        },
      },
    });

    let filteredVans = [...vans];

    // Filter by location radius if center coords are provided
    if (latParam && lngParam) {
      const centerLat = parseFloat(latParam);
      const centerLng = parseFloat(lngParam);
      const radiusKm = radiusParam ? parseFloat(radiusParam) : 10;

      filteredVans = filteredVans
        .map((van) => {
          const dist = getDistance(centerLat, centerLng, van.latitude, van.longitude);
          return { ...van, distance: dist };
        })
        .filter((van) => van.distance <= radiusKm)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else {
      // Sort alphabetically if no lat/lng provided
      filteredVans.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Filter by price (checking 30-min price tier as reference or maximum price)
    if (maxPrice) {
      const priceLimit = parseFloat(maxPrice);
      filteredVans = filteredVans.filter((van) => van.price30 <= priceLimit);
    }

    // Filter by attendant
    if (hasAttendant === 'true') {
      filteredVans = filteredVans.filter((van) => van.hasAttendant === true);
    }

    // Filter by amenities
    if (amenitiesParam) {
      const requiredAmenities = amenitiesParam.split(',').map((a) => a.trim().toLowerCase());
      filteredVans = filteredVans.filter((van) => {
        const vanAmenities = van.amenities.map((a) => a.toLowerCase());
        return requiredAmenities.every((req) => vanAmenities.includes(req));
      });
    }

    return NextResponse.json({
      success: true,
      vans: filteredVans,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
