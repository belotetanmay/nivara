import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { logAdminAction } from '@/lib/services/audit';
import { refundPayment } from '@/lib/services/payment';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await params;
    const { status } = await request.json();

    if (!status || !Object.values(BookingStatus).includes(status as BookingStatus)) {
      return NextResponse.json({ error: 'Invalid or missing booking status' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    let refundProcessed = false;

    // If admin cancels, check if we need to refund
    if (status === BookingStatus.CANCELLED) {
      if (booking.payment && booking.payment.status === PaymentStatus.SUCCESS && booking.payment.gatewayRef) {
        const refundRes = await refundPayment(booking.payment.gatewayRef);
        if (refundRes.success) {
          refundProcessed = true;
        }
      }
    }

    await db.$transaction(async (tx) => {
      // 1. Update Booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: status as BookingStatus },
      });

      // 2. Release slot if cancelled
      if (status === BookingStatus.CANCELLED) {
        await tx.availability.update({
          where: { id: booking.slotId },
          data: { isBooked: false },
        });
      }

      // 3. Update payment status if refunded
      if (refundProcessed && booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });
      }
    });

    // Write audit log
    await logAdminAction(
      payload.userId,
      'OVERRIDE_BOOKING_STATUS',
      `Booking:${bookingId}`,
      `Overrode status of booking ${booking.bookingCode} to ${status}. Refund processed: ${refundProcessed}`
    );

    return NextResponse.json({
      success: true,
      message: `Booking status successfully overridden to ${status}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
