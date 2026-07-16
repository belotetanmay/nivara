import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';

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

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (comment.trim().length < 20) {
      return NextResponse.json({ error: 'Comment must be at least 20 characters long' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        review: true,
      },
    });

    if (!booking || booking.customerId !== payload.userId) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      return NextResponse.json({ error: 'You can only review completed sessions' }, { status: 400 });
    }

    if (booking.review) {
      return NextResponse.json({ error: 'A review has already been submitted for this session' }, { status: 400 });
    }

    // Save review and update rating in a transaction
    await db.$transaction(async (tx) => {
      // 1. Create review
      await tx.review.create({
        data: {
          bookingId,
          customerId: payload.userId,
          vanId: booking.vanId,
          rating,
          comment,
        },
      });

      // 2. Fetch all reviews for this vendor's vans to recalculate avg
      const allVendorReviews = await tx.review.findMany({
        where: {
          van: {
            vendorId: booking.vendorId,
          },
        },
        select: {
          rating: true,
        },
      });

      const totalReviewsCount = allVendorReviews.length;
      const sumRatings = allVendorReviews.reduce((sum, r) => sum + r.rating, 0);
      const ratingAvg = totalReviewsCount > 0 ? sumRatings / totalReviewsCount : 0;

      // 3. Update vendor stats
      await tx.vendorProfile.update({
        where: { id: booking.vendorId },
        data: {
          ratingAvg,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
