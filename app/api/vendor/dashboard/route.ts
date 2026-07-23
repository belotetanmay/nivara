import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ success: false, error: 'Vendor profile not found' }, { status: 404 });
    }

    // Get all bookings for calculations
    const bookings = await db.booking.findMany({
      where: {
        vendorId: vendorProfile.id,
      },
      include: {
        payment: true,
        availability: true,
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            kycStatus: true,
          }
        },
        van: {
          select: {
            title: true,
            address: true,
          }
        }
      },
    });

    const successfulBookings = bookings.filter(
      (b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED
    );

    const totalBookings = successfulBookings.length;
    const totalGrossRevenue = successfulBookings.reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);
    const vendorEarnings = totalGrossRevenue * 0.80; // 80% Vendor Share
    const averageBookingValue = totalBookings > 0 ? totalGrossRevenue / totalBookings : 0;

    // Time-based calculations (using availability slot startTime)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayRevenue = successfulBookings
      .filter((b) => new Date(b.availability.startTime) >= startOfToday)
      .reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);

    const weeklyRevenue = successfulBookings
      .filter((b) => new Date(b.availability.startTime) >= startOfWeek)
      .reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);

    const monthlyRevenue = successfulBookings
      .filter((b) => new Date(b.availability.startTime) >= startOfMonth)
      .reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);

    // Active bookings count (PENDING or CONFIRMED)
    const activeBookingsCount = bookings.filter(
      (b) => b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED
    ).length;

    // Separate active inbox for frontend
    const activeInbox = bookings.filter(
      (b) => b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED
    );

    // Past sessions for frontend
    const pastSessions = bookings.filter(
      (b) => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED
    );

    return NextResponse.json({
      success: true,
      vendorProfile,
      bookings,
      activeInbox,
      pastSessions,
      earnings: {
        totalEarnings: totalGrossRevenue, // Total gross booking value
        vendorEarnings,                   // 80% Vendor Earnings
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        totalBookings,
        averageBookingValue,
        completedSessionsCount: successfulBookings.filter(b => b.status === BookingStatus.COMPLETED).length,
        utilizationRate: totalBookings > 0 ? Math.min(100, Math.round((totalBookings / 30) * 100)) : 15,
        payoutDetails: vendorProfile.payoutDetails || 'No bank account linked.',
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch vendor dashboard stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve dashboard analytics.' }, { status: 500 });
  }
}
