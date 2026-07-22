import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractToken, verifyToken } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';
import { sendNotification } from '@/lib/notifications';

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

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

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
          },
        },
        van: {
          select: {
            title: true,
            address: true,
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
    console.error('Failed to fetch vendor bookings:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const { bookingId, status } = await request.json();

    if (!bookingId || !status || !Object.values(BookingStatus).includes(status)) {
      return NextResponse.json({ error: 'Booking ID and valid status are required' }, { status: 400 });
    }

    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        vendorId: vendorProfile.id,
      },
      include: {
        van: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update booking status
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // If cancelled, release slot
    if (status === BookingStatus.CANCELLED) {
      await db.availability.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
    }

    // Notify Customer
    if (booking.customerId) {
      let msg = `Your booking ${booking.bookingCode} for ${booking.van.title} status has been updated to ${status}.`;
      if (status === BookingStatus.CONFIRMED) {
        msg = `Your booking ${booking.bookingCode} for ${booking.van.title} is CONFIRMED by the host!`;
      } else if (status === BookingStatus.COMPLETED) {
        msg = `Your session for ${booking.van.title} is completed. Thank you for booking with Nivara!`;
      }

      await sendNotification(
        booking.customerId,
        `Booking ${status}`,
        msg
      );
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error('Failed to update booking status:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
