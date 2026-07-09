import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { Role, KYCStatus, VanStatus, BookingStatus, PaymentStatus } from '@prisma/client';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await db.booking.findMany({
      where: {
        customerId: payload.userId,
      },
      include: {
        van: {
          select: {
            title: true,
            address: true,
            hasAttendant: true,
            attendantName: true,
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
        review: {
          select: {
            id: true,
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

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user KYC status
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.kycStatus !== KYCStatus.VERIFIED) {
      return NextResponse.json({
        error: 'KYC_NOT_VERIFIED',
        message: 'You must complete and pass identity verification before reserving a wellness pod.',
      }, { status: 403 });
    }

    const { vanId, slotId, sessionLength } = await request.json();
    if (!vanId || !slotId || !sessionLength) {
      return NextResponse.json({ error: 'Van ID, slot ID, and session length are required' }, { status: 400 });
    }

    // Check van
    const van = await db.van.findFirst({
      where: { id: vanId, status: VanStatus.ACTIVE },
    });

    if (!van) {
      return NextResponse.json({ error: 'Van not found or inactive' }, { status: 404 });
    }

    // Check availability slot
    const slot = await db.availability.findFirst({
      where: { id: slotId, vanId, isBooked: false },
    });

    if (!slot) {
      return NextResponse.json({ error: 'Selected slot is no longer available' }, { status: 400 });
    }

    // Determine price
    let amount = van.price30;
    if (sessionLength === 15) amount = van.price15;
    if (sessionLength === 45) amount = van.price45;

    // Generate unique booking code
    const r1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const r2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingCode = `NV-${r1}-${r2}`;

    // Execute booking creation inside transaction
    const booking = await db.$transaction(async (tx) => {
      // 1. Lock slot
      await tx.availability.update({
        where: { id: slotId },
        data: { isBooked: true },
      });

      // 2. Create booking
      const newBooking = await tx.booking.create({
        data: {
          customerId: payload.userId,
          vanId,
          vendorId: van.vendorId,
          slotId,
          sessionLength,
          status: BookingStatus.PENDING,
          bookingCode,
        },
      });

      // 3. Create initial payment log
      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          amount,
          currency: 'INR',
          status: PaymentStatus.INITIATED,
        },
      });

      return newBooking;
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
