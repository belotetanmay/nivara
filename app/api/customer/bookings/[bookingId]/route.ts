import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { refundPayment } from '@/lib/services/payment';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await params;

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        van: {
          select: {
            title: true,
            address: true,
            hasAttendant: true,
            attendantName: true,
            latitude: true,
            longitude: true,
            currentLatitude: true,
            currentLongitude: true,
            photos: true,
          },
        },
        availability: {
          select: {
            startTime: true,
            endTime: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            gatewayRef: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Access control: only customer who booked, or the vendor owning the van, or admin
    const isOwnerCustomer = booking.customerId === payload.userId;
    
    // Check if vendor
    let isOwnerVendor = false;
    if (payload.role === 'VENDOR') {
      const vendorProfile = await db.vendorProfile.findUnique({
        where: { userId: payload.userId },
      });
      if (vendorProfile && booking.vendorId === vendorProfile.id) {
        isOwnerVendor = true;
      }
    }

    const isAdmin = payload.role === 'ADMIN';

    if (!isOwnerCustomer && !isOwnerVendor && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized access to booking' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        availability: true,
      },
    });

    if (!booking || booking.customerId !== payload.userId) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Cancellation policy: only if status is PENDING or CONFIRMED
    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
      return NextResponse.json({ error: 'Booking cannot be cancelled in its current state' }, { status: 400 });
    }

    const now = new Date();
    const startTime = new Date(booking.availability.startTime);
    const timeDiffMs = startTime.getTime() - now.getTime();
    const isLateCancellation = timeDiffMs < 60 * 60 * 1000; // less than 60 minutes before start time

    // Check if refund is needed
    let refundProcessed = false;
    let refundAmount = 0;
    let cancellationFee = 0;

    if (booking.payment && booking.payment.status === PaymentStatus.SUCCESS && booking.payment.gatewayRef) {
      const totalPaid = booking.payment.amount;
      if (isLateCancellation) {
        // Late cancellation: 50% fee applies, 50% balance refunded
        cancellationFee = Number((totalPaid * 0.5).toFixed(2));
        refundAmount = Number((totalPaid * 0.5).toFixed(2));
      } else {
        // Free cancellation: 100% refunded
        cancellationFee = 0;
        refundAmount = totalPaid;
      }

      if (refundAmount > 0) {
        const refundRes = await refundPayment(booking.payment.gatewayRef, refundAmount);
        if (!refundRes.success) {
          return NextResponse.json({ error: refundRes.error || 'Failed to refund payment' }, { status: 500 });
        }
        refundProcessed = true;
      }
    }

    // Run cancellation db updates in transaction
    await db.$transaction(async (tx) => {
      // 1. Release slot
      await tx.availability.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });

      // 2. Cancel booking
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      // 3. Update payment log to REFUNDED or FAILED depending on payment state
      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: {
            status: refundProcessed ? PaymentStatus.REFUNDED : PaymentStatus.FAILED,
            amount: isLateCancellation ? cancellationFee : booking.payment.amount, // update paid amount to reflect cancellation fee retained
          },
        });
      }
    });

    const successMsg = isLateCancellation 
      ? `Booking cancelled late. A 50% cancellation fee of ₹${cancellationFee} was retained, and the remaining ₹${refundAmount} was refunded.`
      : `Booking cancelled successfully. A full refund of ₹${refundAmount} has been initiated.`;

    return NextResponse.json({
      success: true,
      message: successMsg,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
