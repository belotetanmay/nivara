import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ activeBooking: null });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ activeBooking: null });
    }

    const now = new Date();

    // Find any CONFIRMED booking where current time is within start/end slot windows
    const activeBooking = await db.booking.findFirst({
      where: {
        customerId: payload.userId,
        status: BookingStatus.CONFIRMED,
        availability: {
          startTime: { lte: now },
          endTime: { gte: now },
        },
      },
      include: {
        van: {
          select: {
            title: true,
            address: true,
            price15: true, // For overtime rate
          },
        },
        availability: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      activeBooking,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
