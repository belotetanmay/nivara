import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { VanStatus } from '@prisma/client';
import { geocodeAddress } from '@/lib/services/location';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const vans = await db.van.findMany({
      where: { vendorId: vendorProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      vans,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      address,
      amenities,
      photos,
      price15,
      price30,
      price45,
      serviceRadius,
      hasAttendant,
      attendantName,
    } = body;

    if (!title || !description || !address || price15 === undefined || price30 === undefined || price45 === undefined || serviceRadius === undefined) {
      return NextResponse.json({ error: 'Missing required van details' }, { status: 400 });
    }

    // Geocode address
    const coords = await geocodeAddress(address);

    const van = await db.van.create({
      data: {
        vendorId: vendorProfile.id,
        title,
        description,
        address,
        amenities: amenities || [],
        photos: photos || [],
        latitude: coords.lat,
        longitude: coords.lng,
        serviceRadius: parseFloat(serviceRadius),
        price15: parseFloat(price15),
        price30: parseFloat(price30),
        price45: parseFloat(price45),
        status: VanStatus.UNDER_REVIEW, // listings start as under review by admin
        hasAttendant: !!hasAttendant,
        attendantName: hasAttendant ? attendantName : null,
      },
    });

    return NextResponse.json({
      success: true,
      vanId: van.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
