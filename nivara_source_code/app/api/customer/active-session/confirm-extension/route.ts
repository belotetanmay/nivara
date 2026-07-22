import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { PaymentStatus } from '@prisma/client';

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

    const { bookingId, nextSlotId, amount } = await request.json();
    if (!bookingId || !nextSlotId) {
      return NextResponse.json({ error: 'Booking ID and Next Slot ID are required' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { availability: true },
    });

    if (!booking || booking.customerId !== payload.userId) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const nextSlot = await db.availability.findUnique({
      where: { id: nextSlotId },
    });

    if (!nextSlot || nextSlot.isBooked) {
      return NextResponse.json({ error: 'Extension slot is no longer available' }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      // 1. Mark next slot as booked
      await tx.availability.update({
        where: { id: nextSlotId },
        data: { isBooked: true },
      });

      // 2. Extend original slot's endTime
      await tx.availability.update({
        where: { id: booking.slotId },
        data: {
          endTime: nextSlot.endTime,
        },
      });

      // 3. Update booking sessionLength and session details
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          sessionLength: booking.sessionLength + 30, // Extend by 30 mins
        },
      });

      // 4. Create successful payment log for the extension
      await tx.payment.create({
        data: {
          bookingId: bookingId,
          amount: parseFloat(amount || '0'),
          currency: 'INR',
          status: PaymentStatus.SUCCESS,
          gatewayRef: `EXT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Session successfully extended.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
