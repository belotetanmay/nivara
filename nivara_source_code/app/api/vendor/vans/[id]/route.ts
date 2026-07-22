import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { geocodeAddress } from '@/lib/services/location';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const van = await db.van.findUnique({
      where: { id },
    });

    if (!van || van.vendorId !== vendorProfile.id) {
      return NextResponse.json({ error: 'Van not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      van,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const van = await db.van.findUnique({
      where: { id },
    });

    if (!van || van.vendorId !== vendorProfile.id) {
      return NextResponse.json({ error: 'Van not found or unauthorized' }, { status: 404 });
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

    let updateData: any = {
      title,
      description,
      amenities,
      photos,
      price15: price15 !== undefined ? parseFloat(price15) : undefined,
      price30: price30 !== undefined ? parseFloat(price30) : undefined,
      price45: price45 !== undefined ? parseFloat(price45) : undefined,
      serviceRadius: serviceRadius !== undefined ? parseFloat(serviceRadius) : undefined,
      hasAttendant,
      attendantName: hasAttendant ? attendantName : null,
    };

    if (address && address !== van.address) {
      const coords = await geocodeAddress(address);
      updateData.address = address;
      updateData.latitude = coords.lat;
      updateData.longitude = coords.lng;
    }

    await db.van.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Van updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
