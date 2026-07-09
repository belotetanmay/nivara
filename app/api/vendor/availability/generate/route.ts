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

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const { vanId, date } = await request.json(); // date as YYYY-MM-DD

    if (!vanId || !date) {
      return NextResponse.json({ error: 'Van ID and date are required' }, { status: 400 });
    }

    const van = await db.van.findUnique({
      where: { id: vanId },
    });

    if (!van || van.vendorId !== vendorProfile.id) {
      return NextResponse.json({ error: 'Van not found or unauthorized' }, { status: 404 });
    }

    // Generate standard hour slots from 9:00 to 18:00
    const slotTimes = [
      { start: 9, end: 10 },
      { start: 10, end: 11 },
      { start: 11, end: 12 },
      { start: 12, end: 13 },
      { start: 13, end: 14 },
      { start: 14, end: 15 },
      { start: 15, end: 16 },
      { start: 16, end: 17 },
      { start: 17, end: 18 },
    ];

    let createdCount = 0;

    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    for (const time of slotTimes) {
      const startTime = new Date(baseDate);
      startTime.setHours(time.start, 0, 0, 0);

      const endTime = new Date(baseDate);
      endTime.setHours(time.end, 0, 0, 0);

      // Check if slot already exists
      const existing = await db.availability.findFirst({
        where: {
          vanId,
          startTime,
        },
      });

      if (!existing) {
        await db.availability.create({
          data: {
            vanId,
            date: baseDate,
            startTime,
            endTime,
            isBooked: false,
          },
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      created: createdCount,
      message: `Successfully generated ${createdCount} standard hour slots.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
