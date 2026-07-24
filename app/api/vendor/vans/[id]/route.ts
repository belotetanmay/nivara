import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/auth';
import { VanStatus } from '@prisma/client';
import { geocodeAddress } from '@/lib/services/location';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
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
      latitude,
      longitude,
    } = body;

    let coords;
    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      coords = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
    } else if (address !== undefined && address !== null) {
      coords = await geocodeAddress(address);
    }

    const updatedVan = await db.van.update({
      where: {
        id,
        vendorId: vendorProfile.id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(coords && { latitude: coords.lat, longitude: coords.lng }),
        ...(amenities !== undefined && { amenities }),
        ...(photos !== undefined && { photos }),
        ...(price15 !== undefined && { price15: parseFloat(price15) }),
        ...(price30 !== undefined && { price30: parseFloat(price30) }),
        ...(price45 !== undefined && { price45: parseFloat(price45) }),
        ...(serviceRadius !== undefined && { serviceRadius: parseFloat(serviceRadius) }),
        ...(hasAttendant !== undefined && { hasAttendant: !!hasAttendant }),
        ...(attendantName !== undefined && { attendantName }),
      },
    });

    return NextResponse.json({
      success: true,
      van: updatedVan,
    });
  } catch (error: any) {
    console.error('Failed to update van:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const { status } = await request.json();

    if (!status || !Object.values(VanStatus).includes(status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
    }

    const updatedVan = await db.van.update({
      where: {
        id,
        vendorId: vendorProfile.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      success: true,
      van: updatedVan,
    });
  } catch (error: any) {
    console.error('Failed to patch van status:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    await db.van.delete({
      where: {
        id,
        vendorId: vendorProfile.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Van deleted successfully',
    });
  } catch (error: any) {
    console.error('Failed to delete van:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
