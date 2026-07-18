import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { Role, KYCStatus, VendorStatus, VanStatus, PaymentStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Parallelize all database queries to reduce network round-trips to Supabase
    const [
      totalUsers,
      totalVendors,
      totalVans,
      activeVans,
      vansUnderReview,
      totalBookings,
      bookingsToday,
      successfulPayments,
      pendingKycCount,
      pendingVendorCount,
      recentBookings
    ] = await Promise.all([
      db.user.count({ where: { role: Role.CUSTOMER } }),
      db.user.count({ where: { role: Role.VENDOR } }),
      db.van.count(),
      db.van.count({ where: { status: VanStatus.ACTIVE } }),
      db.van.count({ where: { status: VanStatus.UNDER_REVIEW } }),
      db.booking.count(),
      db.booking.count({
        where: {
          createdAt: {
            gte: todayStart,
          },
        },
      }),
      db.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCESS,
        },
        _sum: {
          amount: true,
        },
      }),
      db.kYCDocument.count({
        where: {
          status: KYCStatus.PENDING,
        },
      }),
      db.vendorProfile.count({
        where: {
          verificationStatus: VendorStatus.PENDING,
        },
      }),
      db.booking.findMany({
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
      })
    ]);

    const gmv = successfulPayments._sum.amount || 0;

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
