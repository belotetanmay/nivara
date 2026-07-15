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

    // Look for adjacent availability slot starting exactly when this one ends
    const nextSlot = await db.availability.findFirst({
      where: {
        vanId: booking.vanId,
        isBooked: false,
        startTime: currentEndTime,
      },
    });

    if (nextSlot) {
      return NextResponse.json({
        success: true,
        available: true,
        nextSlotId: nextSlot.id,
        price: booking.van.price15, // rate for extension (30 mins or base)
        vanTitle: booking.van.title,
      });
    } else {
      return NextResponse.json({
        success: true,
        available: false,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
