import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';
import { sendNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, rating, comment } = await request.json();

    if (!bookingId || !rating || !comment) {
      return NextResponse.json({ error: 'Booking ID, rating, and comment are required' }, { status: 400 });
    }

    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        customerId: payload.userId,
      },
      include: {
        vendor: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      return NextResponse.json({ error: 'Reviews can only be submitted for completed sessions' }, { status: 400 });
    }

    // Check if review already exists
    const existingReview = await db.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'Review already submitted for this booking' }, { status: 400 });
    }

    // Create review
    const review = await db.review.create({
      data: {
        bookingId,
        customerId: payload.userId,
        vanId: booking.vanId,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        comment,
      },
    });

    // Recalculate Vendor average rating
    const allVendorReviews = await db.review.findMany({
      where: {
        van: {
          vendorId: booking.vendorId,
        },
      },
      select: { rating: true },
    });

    if (allVendorReviews.length > 0) {
      const avg = allVendorReviews.reduce((sum, r) => sum + r.rating, 0) / allVendorReviews.length;
      await db.vendorProfile.update({
        where: { id: booking.vendorId },
        data: { ratingAvg: parseFloat(avg.toFixed(2)) },
      });
    }

    // Notify vendor
    if (booking.vendor?.userId) {
      await sendNotification(
        booking.vendor.userId,
        'New Guest Review',
        `A customer submitted a ${rating}-star review for your wellness session.`
      );
    }

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error: any) {
    console.error('Failed to create review:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
