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
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vanId, date, startTime, endTime } = await request.json();

    if (!vanId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Van ID, Date, Start Time, and End Time are required.' }, { status: 400 });
    }

    // Verify van belongs to this vendor
    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found.' }, { status: 404 });
    }

    const van = await db.van.findUnique({
      where: { id: vanId },
    });

    if (!van || van.vendorId !== vendorProfile.id) {
      return NextResponse.json({ error: 'Van not found or unauthorized.' }, { status: 404 });
    }

    // Combine YYYY-MM-DD date string with HH:MM time strings
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return NextResponse.json({ error: 'Invalid date or time formats provided.' }, { status: 400 });
    }

    if (endDateTime.getTime() <= startDateTime.getTime()) {
      return NextResponse.json({ error: 'End time must be after start time.' }, { status: 400 });
    }

    // Check for existing overlapping slots
    const overlaps = await db.availability.findFirst({
      where: {
        vanId,
        OR: [
          {
            startTime: { lte: startDateTime },
            endTime: { gte: startDateTime },
          },
          {
            startTime: { lte: endDateTime },
            endTime: { gte: endDateTime },
          },
          {
            startTime: { gte: startDateTime },
            endTime: { lte: endDateTime },
          },
        ],
      },
    });

    if (overlaps) {
      return NextResponse.json({ error: 'A slot already exists that overlaps with this time range.' }, { status: 400 });
    }

    // Create the slot
    const slot = await db.availability.create({
      data: {
        vanId,
        date: new Date(date),
        startTime: startDateTime,
        endTime: endDateTime,
        isBooked: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Custom open time slot added successfully.',
      slot,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
