import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { availability: true, van: true },
    });

    if (!booking || booking.customerId !== payload.userId) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const currentEndTime = new Date(booking.availability.endTime);
    const extendedEndTime = new Date(currentEndTime.getTime() + 30 * 60000); // extension adds 30 mins

    // 1. Look for adjacent availability slot starting exactly when this one ends
    const nextSlot = await db.availability.findFirst({
      where: {
        vanId: booking.vanId,
        isBooked: false,
        startTime: currentEndTime,
      },
    });

    if (!nextSlot) {
      return NextResponse.json({
        success: true,
        available: false,
      });
    }

    // 2. Check if the extended session encroaches on any subsequent booking's 15-minute cleaning buffer
    const BUFFER_MS = 15 * 60000;
    const nextBooking = await db.booking.findFirst({
      where: {
        vanId: booking.vanId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        availability: {
          startTime: { gte: currentEndTime }
        }
      },
      include: { availability: true },
      orderBy: { availability: { startTime: 'asc' } }
    });

    if (nextBooking) {
      const nextBookingStart = new Date(nextBooking.availability.startTime).getTime();
      const gap = nextBookingStart - extendedEndTime.getTime();
      if (gap < BUFFER_MS) {
        // Violates buffer for the next booking!
        return NextResponse.json({
          success: true,
          available: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      available: true,
      nextSlotId: nextSlot.id,
      price: booking.van.price15, // rate for extension (30 mins or base)
      vanTitle: booking.van.title,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
