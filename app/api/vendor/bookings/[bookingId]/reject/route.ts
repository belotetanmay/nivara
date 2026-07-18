import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');

    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get vendor profile
    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // Find booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking || booking.vendorId !== vendorProfile.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
      return NextResponse.json({ error: 'Only pending or confirmed bookings can be rejected' }, { status: 400 });
    }

    // Run cancellation inside transaction
    await db.$transaction(async (tx) => {
      // 1. Cancel booking
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      // 2. Release slot
      await tx.availability.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });

      // 3. Mark payment as refunded if initialized/success
      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Booking declined and slot released successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
