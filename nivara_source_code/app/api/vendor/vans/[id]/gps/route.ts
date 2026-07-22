import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
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
    const { currentLatitude, currentLongitude } = body;

    // Validate coordinates are either numeric or null
    const lat = typeof currentLatitude === 'number' ? currentLatitude : null;
    const lng = typeof currentLongitude === 'number' ? currentLongitude : null;

    const updatedVan = await db.van.update({
      where: { id },
      data: {
        currentLatitude: lat,
        currentLongitude: lng,
      },
    });

    return NextResponse.json({
      success: true,
      currentLatitude: updatedVan.currentLatitude,
      currentLongitude: updatedVan.currentLongitude,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
