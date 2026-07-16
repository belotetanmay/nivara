import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
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

    const { bookingId } = await params;

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.vendorId !== vendorProfile.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== BookingStatus.PENDING) {
      return NextResponse.json({ error: 'Only pending bookings can be confirmed' }, { status: 400 });
    }

    // Confirm booking
    await db.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
