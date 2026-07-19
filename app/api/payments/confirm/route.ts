import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { bookingId, sessionId } = await request.json();

    if (!bookingId || !sessionId) {
      return NextResponse.json({ success: false, error: 'Booking ID and Session ID are required' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (!booking.payment) {
      return NextResponse.json({ success: false, error: 'Payment details not found' }, { status: 400 });
    }

    // Update inside a transaction to ensure integrity
    await db.$transaction(async (tx) => {
      // 1. Confirm booking
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
        },
      });

      // 2. Mark payment log successful
      await tx.payment.update({
        where: { id: booking.payment!.id },
        data: {
          status: PaymentStatus.SUCCESS,
          gatewayRef: sessionId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      bookingId,
    });
  } catch (error: any) {
    console.error('Payment confirmation API crash:', error);
    return NextResponse.json({ success: false, error: 'Failed to confirm booking payment.' }, { status: 500 });
  }
}
