import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/services/payment';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await params;
    const body = await request.json().catch(() => ({}));
    const paymentMethod = body.paymentMethod || 'card';

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
      },
    });

    if (!booking || booking.customerId !== payload.userId) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!booking.payment) {
      return NextResponse.json({ error: 'Payment record missing for this booking' }, { status: 400 });
    }

    const payment = booking.payment;

    if (paymentMethod === 'wallet') {
      // Fetch user to check wallet balance
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: { walletBalance: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }

      if (user.walletBalance < payment.amount) {
        return NextResponse.json({ error: 'Insufficient Nivara Balance. Please refuel your wallet first.' }, { status: 400 });
      }

      // Process wallet payment inside database transaction
      await db.$transaction(async (tx) => {
        // 1. Deduct balance from user wallet
        await tx.user.update({
          where: { id: payload.userId },
          data: {
            walletBalance: {
              decrement: payment.amount,
            },
          },
        });

        // 2. Confirm booking
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.CONFIRMED,
          },
        });

        // 3. Mark payment as success
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESS,
            gatewayRef: `WALLET-${Date.now()}`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        url: `/customer/bookings/${booking.id}/confirmation`,
      });
    }

    // Default card payment via Stripe checkout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await createCheckoutSession({
      bookingId: booking.id,
      amount: payment.amount,
      currency: payment.currency,
      successUrl: `${appUrl}/customer/bookings/${booking.id}/confirmation`,
      cancelUrl: `${appUrl}/customer/search`,
      customerEmail: payload.email,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      isMock: session.isMock,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
