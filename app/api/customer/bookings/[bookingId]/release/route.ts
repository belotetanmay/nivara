import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch booking
    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        customerId: payload.userId,
      },
      include: {
        availability: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PENDING) {
      return NextResponse.json({ error: 'Only active bookings can be ended early' }, { status: 400 });
    }

    // Calculate actual elapsed minutes
    const startTime = new Date(booking.availability.startTime).getTime();
    const nowTime = new Date().getTime();
    const elapsedMinutes = Math.max(1, Math.round((nowTime - startTime) / 60000));

    // 2. Mark booking as completed in database and release the slot
    await db.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.COMPLETED,
          actualDuration: Math.min(booking.sessionLength, elapsedMinutes),
        },
      });

      // Update slot end time to now to release any trailing blocks
      await tx.availability.update({
        where: { id: booking.slotId },
        data: {
          endTime: new Date(),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Session released early. Thank you for using Nivara.',
    });
  } catch (error: any) {
    console.error('Error releasing session early:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
