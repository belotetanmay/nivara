import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VanStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const vans = await db.van.findMany({
      where: {
        status: VanStatus.ACTIVE,
      },
      select: {
        amenities: true,
      },
    });

    // Extract unique amenities/categories
    const allAmenities = new Set<string>();
    vans.forEach((van) => {
      van.amenities.forEach((amenity) => {
        // Standardize naming
        if (amenity) {
          allAmenities.add(amenity.trim());
        }
      });
    });

    let categories = Array.from(allAmenities);
    
    // Fallback default list if no active vans with amenities exist
    if (categories.length === 0) {
      categories = ['Aromatherapy', 'Zero-Gravity Chair', 'Soundproofing', 'Ambient Lighting', 'Air Conditioning'];
    }

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
