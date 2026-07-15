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

    // Generate standard slots (30m session + 15m cleaning buffer gaps)
    const slotTimes = [
      { startHour: 9, startMin: 0, endHour: 9, endMin: 30 },
      { startHour: 9, startMin: 45, endHour: 10, endMin: 15 },
      { startHour: 10, startMin: 30, endHour: 11, endMin: 0 },
      { startHour: 11, startMin: 15, endHour: 11, endMin: 45 },
      { startHour: 12, startMin: 0, endHour: 12, endMin: 30 },
      { startHour: 12, startMin: 45, endHour: 13, endMin: 15 },
      { startHour: 13, startMin: 30, endHour: 14, endMin: 0 },
      { startHour: 14, startMin: 15, endHour: 14, endMin: 45 },
      { startHour: 15, startMin: 0, endHour: 15, endMin: 30 },
      { startHour: 15, startMin: 45, endHour: 16, endMin: 15 },
      { startHour: 16, startMin: 30, endHour: 17, endMin: 0 },
      { startHour: 17, startMin: 15, endHour: 17, endMin: 45 },
    ];

    let createdCount = 0;

    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    for (const time of slotTimes) {
      const startTime = new Date(baseDate);
      startTime.setHours(time.startHour, time.startMin, 0, 0);

      const endTime = new Date(baseDate);
      endTime.setHours(time.endHour, time.endMin, 0, 0);

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
