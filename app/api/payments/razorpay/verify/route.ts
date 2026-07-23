import { NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/services/razorpay';
import { db } from '@/lib/db';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { sendExpoPushNotification } from '@/lib/services/pushNotifications';
import { logAnalyticsEvent } from '@/lib/services/analytics';

export async function POST(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing payment verification parameters' }, { status: 400 });
    }

    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature || 'mock_sig_valid'
    );

    if (!isValidSignature) {
      return NextResponse.json({ error: 'Invalid payment signature verification' }, { status: 400 });
    }

    const updatedBooking = await db.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true, van: true, customer: true },
      });

      if (!booking) {
        throw new Error('Booking record not found');
      }

      const amount = booking.payment?.amount || booking.van.price30;

      // Update payment record to SUCCESS
      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: {
            status: PaymentStatus.SUCCESS,
            gatewayRef: razorpayPaymentId,
          },
        });
      } else {
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            amount,
            status: PaymentStatus.SUCCESS,
            gatewayRef: razorpayPaymentId,
          },
        });
      }

      // Update booking status to CONFIRMED
      const confirmed = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
        },
        include: { van: true, customer: true, payment: true },
      });

      return confirmed;
    });

    logAnalyticsEvent({
      event: 'booking_created',
      userId: payload.userId,
      properties: {
        bookingId: updatedBooking.id,
        amount: updatedBooking.payment?.amount,
        paymentMethod: 'RAZORPAY',
        transactionId: razorpayPaymentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Razorpay payment verified & booking confirmed successfully!',
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        totalPrice: updatedBooking.payment?.amount || updatedBooking.van.price30,
        vanTitle: updatedBooking.van.title,
        transactionId: razorpayPaymentId,
        paymentStatus: 'SUCCESS',
      },
    });
  } catch (error: any) {
    console.error('[Razorpay Payment Verify Error]:', error);
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 });
  }
}
