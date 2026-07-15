import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { availability: true },
    });

    if (!booking || booking.customerId !== payload.userId) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      return NextResponse.json({ error: 'Only active confirmed bookings can be ended early' }, { status: 400 });
    }

    // Execute session end and slot release inside a transaction
    await db.$transaction(async (tx) => {
      // 1. Mark booking completed and store actual duration
      const startTime = new Date(booking.availability.startTime);
      const now = new Date();
      const elapsedMinutes = Math.max(1, Math.round((now.getTime() - startTime.getTime()) / 60000));

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.COMPLETED,
          actualDuration: elapsedMinutes,
        },
      });

      // 2. Release availability slot so it is bookable again
      await tx.availability.update({
        where: { id: booking.slotId },
        data: {
          isBooked: false,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Session ended early. Availability slot released.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
