import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { PaymentStatus } from '@prisma/client';

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

    // Get vendor profile
    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // Fetch bookings for this vendor
    const bookings = await db.booking.findMany({
      where: {
        vendorId: vendorProfile.id,
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            kycStatus: true,
          },
        },
        van: {
          select: {
            title: true,
            address: true,
            price30: true,
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
            amount: true,
            status: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 1. Get all vans owned by this vendor
    const vans = await db.van.findMany({
      where: { vendorId: vendorProfile.id },
      select: { id: true },
    });
    const vanIds = vans.map((v) => v.id);

    // 2. Count slots
    const totalSlots = await db.availability.count({
      where: { vanId: { in: vanIds } },
    });
    const bookedSlots = await db.availability.count({
      where: { vanId: { in: vanIds }, isBooked: true },
    });

    // 3. Calculate utilization percentage
    const utilizationRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    // Calculate earnings details
    const successPayments = bookings
      .filter((b) => b.payment && b.payment.status === PaymentStatus.SUCCESS)
      .map((b) => b.payment!.amount);

    const totalEarnings = successPayments.reduce((sum, amt) => sum + amt, 0);
    const completedSessionsCount = bookings.filter((b) => b.status === 'COMPLETED').length;

    return NextResponse.json({
      success: true,
      vendorProfile,
      bookings,
      earnings: {
        totalEarnings,
        completedSessionsCount,
        utilizationRate,
        payoutDetails: vendorProfile.payoutDetails,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
