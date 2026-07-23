import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { Role, KYCStatus, VendorStatus, VanStatus, PaymentStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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
      pendingKycCount,
      pendingVendorCount,
      recentBookings,
      successfulBookings
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
      }),
      db.booking.findMany({
        where: {
          payment: {
            status: PaymentStatus.SUCCESS
          }
        },
        include: {
          payment: true,
          availability: true,
        }
      })
    ]);

    // Financial calculations based on the revenue split (80% Vendor / 20% Platform)
    const totalGrossRevenue = successfulBookings.reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);
    const vendorPayouts = totalGrossRevenue * 0.80;
    const platformRevenue = totalGrossRevenue * 0.20;

    // Platform share splits
    const operatingExpenses = totalGrossRevenue * 0.10;
    const platformReinvestment = totalGrossRevenue * 0.05;
    const businessProfit = totalGrossRevenue * 0.05;

    // Revenue by Session Duration
    const duration30Revenue = successfulBookings
      .filter(b => b.sessionLength === 30)
      .reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);

    const duration45Revenue = successfulBookings
      .filter(b => b.sessionLength === 45)
      .reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);

    const duration60Revenue = successfulBookings
      .filter(b => b.sessionLength === 60)
      .reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);

    // Timeframe-based revenue (daily, weekly, monthly) using availability startTime
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyRevenue = successfulBookings
      .filter(b => new Date(b.availability.startTime) >= startOfToday)
      .reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);

    const weeklyRevenue = successfulBookings
      .filter(b => new Date(b.availability.startTime) >= startOfWeek)
      .reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);

    const monthlyRevenue = successfulBookings
      .filter(b => new Date(b.availability.startTime) >= startOfMonth)
      .reduce((sum, b) => sum + Number(b.payment?.amount || 0), 0);

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
        pendingKycCount,
        pendingVendorCount,
        recentBookings,
        // Financial metrics
        totalGrossRevenue,
        vendorPayouts,
        platformRevenue,
        operatingExpenses,
        platformReinvestment,
        businessProfit,
        dailyRevenue,
        weeklyRevenue,
        monthlyRevenue,
        duration30Revenue,
        duration45Revenue,
        duration60Revenue
      },
    });
  } catch (error: any) {
    console.error('Admin stats API error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected internal error occurred.' }, { status: 500 });
  }
}
