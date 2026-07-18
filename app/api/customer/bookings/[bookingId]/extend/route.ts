import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';

export async function POST(
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

    // 1. Fetch booking and slot details
    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        customerId: payload.userId,
      },
      include: {
        availability: true,
        van: true,
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PENDING) {
      return NextResponse.json({ error: 'Only active bookings can be extended' }, { status: 400 });
    }

    const EXTENSION_MINUTES = 30;
    const currentEndTime = new Date(booking.availability.endTime);
    const proposedEndTime = new Date(currentEndTime.getTime() + EXTENSION_MINUTES * 60 * 1000);

    // 2. Check 15-minute cleaning buffer gap against subsequent bookings
    const BUFFER_MS = 15 * 60000;
    const subsequentBookings = await db.booking.findMany({
      where: {
        vanId: booking.vanId,
        id: { not: bookingId },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.COMPLETED] },
        availability: {
          startTime: {
            gte: currentEndTime,
          },
        },
      },
      include: {
        availability: true,
      },
    });

    for (const sub of subsequentBookings) {
      const subStart = new Date(sub.availability.startTime).getTime();
      const reqEnd = proposedEndTime.getTime();
      const gap = subStart - reqEnd;

      if (reqEnd > subStart || (gap >= 0 && gap < BUFFER_MS)) {
        return NextResponse.json({
          error: 'BUFFER_CONFLICT',
          message: 'Cannot extend session: violates the 15-minute buffer gap of a subsequent booking.',
        }, { status: 409 });
      }
    }

    // 3. Calculate price increment: 30m base slot pricing
    const extensionPrice = booking.van.price15; // van.price15 is 30m slot price

    // 4. Update booking length, slot end time, and payment in database
    await db.$transaction(async (tx) => {
      // Update slot end time
      await tx.availability.update({
        where: { id: booking.slotId },
        data: { endTime: proposedEndTime },
      });

      // Update booking session length
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          sessionLength: booking.sessionLength + EXTENSION_MINUTES,
        },
      });

      // Update payment details if payment exists
      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: {
            amount: booking.payment.amount + extensionPrice,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Session successfully extended by ${EXTENSION_MINUTES} minutes.`,
      newEndTime: proposedEndTime.toISOString(),
    });
  } catch (error: any) {
    console.error('Error extending session:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
