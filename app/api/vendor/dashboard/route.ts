import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/auth';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // Calculate total earnings from completed payments for this vendor
    const completedPayments = await db.payment.findMany({
      where: {
        booking: {
          vendorId: vendorProfile.id,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
        },
      },
      select: { amount: true },
    });

    const totalEarnings = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Active bookings (PENDING or CONFIRMED)
    const activeBookingsCount = await db.booking.count({
      where: {
        vendorId: vendorProfile.id,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
    });

    return NextResponse.json({
      success: true,
      totalEarnings,
      activeBookings: activeBookingsCount,
      ratingAvg: vendorProfile.ratingAvg || 5.0,
      totalBookings: vendorProfile.totalBookings || 0,
    });
  } catch (error: any) {
    console.error('Failed to fetch vendor dashboard stats:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
