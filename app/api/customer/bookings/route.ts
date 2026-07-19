import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { Role, KYCStatus, VanStatus, BookingStatus, PaymentStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
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
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user KYC status
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    // KYC check bypassed for friction-free reservation booking
    /*
    if (!user || user.kycStatus !== KYCStatus.VERIFIED) {
      return NextResponse.json({
        error: 'KYC_NOT_VERIFIED',
        message: 'You must complete and pass identity verification before reserving a wellness pod.',
      }, { status: 403 });
    }
    */

    const { 
      vanId, 
      slotId, 
      sessionLength, 
      scent, 
      lighting, 
      audio,
      serviceModel,
      pickupAddress,
      dropoffAddress,
      includeParkingFee
    } = await request.json();

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

    // Determine price: 30 min (van.price15), 45 min (van.price30), 60 min (van.price45)
    let baseAmount = Number(van.price15);
    if (sessionLength === 45) baseAmount = Number(van.price30);
    if (sessionLength === 60) baseAmount = Number(van.price45);

    const parkingFeeAmount = includeParkingFee ? 150.0 : 0.0;
    const totalAmount = baseAmount + parkingFeeAmount;

    // Calculate requested booking start & end times
    const startTime = new Date(slot.startTime);
    const bookingEndTime = new Date(startTime.getTime() + sessionLength * 60000);

    // Enforce 15-minute cleaning buffer against all adjacent active/completed bookings
    const existingBookings = await db.booking.findMany({
      where: {
        vanId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
      },
      include: {
        availability: true
      }
    });

    const BUFFER_MS = 15 * 60000;

    for (const exist of existingBookings) {
      const existStart = new Date(exist.availability.startTime).getTime();
      const existEnd = existStart + exist.sessionLength * 60000;

      const reqStart = startTime.getTime();
      const reqEnd = bookingEndTime.getTime();

      const gapBefore = existStart - reqEnd;
      const gapAfter = reqStart - existEnd;

      const overlaps = reqStart < existEnd && reqEnd > existStart;
      const violatesBefore = gapBefore >= 0 && gapBefore < BUFFER_MS;
      const violatesAfter = gapAfter >= 0 && gapAfter < BUFFER_MS;

      if (overlaps || violatesBefore || violatesAfter) {
        return NextResponse.json({
          error: 'BUFFER_CONFLICT',
          message: 'The requested slot violates the mandatory 15-minute cleaning buffer of an adjacent session.',
        }, { status: 400 });
      }
    }

    // Generate unique booking code
    const r1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const r2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingCode = `NV-${r1}-${r2}`;

    // Execute booking creation inside transaction
    const booking = await db.$transaction(async (tx) => {
      // 1. Lock slot and update its end time to the booking end time
      await tx.availability.update({
        where: { id: slotId },
        data: { 
          isBooked: true,
          endTime: bookingEndTime,
        },
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
          scent: scent || 'Lavender',
          lighting: lighting || 'Sunset Copper',
          audio: audio || 'Binaural Beats',
          serviceModel: serviceModel || 'STEADY',
          pickupAddress: serviceModel === 'PICK_AND_DROP' ? pickupAddress : null,
          dropoffAddress: serviceModel === 'PICK_AND_DROP' ? dropoffAddress : null,
          includeParkingFee: !!includeParkingFee,
          parkingFeeAmount,
        },
      });

      // 3. Create initial payment log
      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          amount: totalAmount,
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
