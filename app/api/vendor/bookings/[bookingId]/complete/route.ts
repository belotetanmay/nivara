import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await params;

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.vendorId !== vendorProfile.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      return NextResponse.json({ error: 'Only confirmed bookings can be marked as complete' }, { status: 400 });
    }

    // Read actual session duration from request body
    let actualDuration: number | null = null;
    try {
      const body = await request.json();
      actualDuration = body.actualDuration ? Number(body.actualDuration) : null;
    } catch (e) {
      // Body may not be present or valid JSON
    }

    let overtimeMinutes = 0;
    let overtimeAmount = 0;
    let overtimeStatus = 'NONE';

    const sessionLength = booking.sessionLength;
    if (actualDuration && actualDuration > sessionLength) {
      overtimeMinutes = actualDuration - sessionLength;
      
      // Calculate overtime amount pro-rata based on price15
      const van = await db.van.findUnique({
        where: { id: booking.vanId },
      });
      if (van) {
        const ratePerMinute = van.price15 / 30;
        overtimeAmount = Number((ratePerMinute * overtimeMinutes).toFixed(2));
        overtimeStatus = 'UNPAID';
      }
    }

    // Mark as completed and update total bookings counter in a transaction
    await db.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { 
          status: BookingStatus.COMPLETED,
          actualDuration: actualDuration || sessionLength,
          overtimeMinutes,
          overtimeAmount,
          overtimeStatus,
        },
      });

      await tx.vendorProfile.update({
        where: { id: vendorProfile.id },
        data: {
          totalBookings: {
            increment: 1,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Booking session marked as completed',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
