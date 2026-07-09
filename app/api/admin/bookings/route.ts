import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    const whereClause: any = {};
    if (statusParam && Object.values(BookingStatus).includes(statusParam as BookingStatus)) {
      whereClause.status = statusParam as BookingStatus;
    }

    const bookings = await db.booking.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        van: {
          select: {
            title: true,
            address: true,
          },
        },
        vendor: {
          select: {
            businessName: true,
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
            id: true,
            amount: true,
            status: true,
            gatewayRef: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
