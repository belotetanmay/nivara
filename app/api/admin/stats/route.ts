import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { Role, KYCStatus, VendorStatus, VanStatus, PaymentStatus } from '@prisma/client';

export async function GET() {
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

    // Counts
    const totalUsers = await db.user.count({ where: { role: Role.CUSTOMER } });
    const totalVendors = await db.user.count({ where: { role: Role.VENDOR } });
    
    const totalVans = await db.van.count();
    const activeVans = await db.van.count({ where: { status: VanStatus.ACTIVE } });
    const vansUnderReview = await db.van.count({ where: { status: VanStatus.UNDER_REVIEW } });

    const totalBookings = await db.booking.count();
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const bookingsToday = await db.booking.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    });

    // GMV (Sum of successful payments)
    const successfulPayments = await db.payment.aggregate({
      where: {
        status: PaymentStatus.SUCCESS,
      },
      _sum: {
        amount: true,
      },
    });
    const gmv = successfulPayments._sum.amount || 0;

    // Review queues count
    const pendingKycCount = await db.kYCDocument.count({
      where: {
        status: KYCStatus.PENDING,
      },
    });

    const pendingVendorCount = await db.vendorProfile.count({
      where: {
        verificationStatus: VendorStatus.PENDING,
      },
    });

    // Recent Bookings (last 10)
    const recentBookings = await db.booking.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        van: {
          select: {
            title: true,
          },
        },
        payment: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalVendors,
        totalVans,
        activeVans,
        vansUnderReview,
        totalBookings,
        bookingsToday,
        gmv,
        pendingKycCount,
        pendingVendorCount,
        recentBookings,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
