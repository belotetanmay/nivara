import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date'); // YYYY-MM-DD
    const all = searchParams.get('all') === 'true'; // If true, return booked slots as well (for host view)

    if (!dateStr) {
      return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const startDate = new Date(dateStr);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateStr);
    endDate.setHours(23, 59, 59, 999);

    let whereClause: any = {
      vanId: id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    let slots = await db.availability.findMany({
      where: whereClause,
      orderBy: {
        startTime: 'asc',
      },
    });

    // If zero slots exist for this van on this date, auto-generate default daily operating slots (9:00, 11:00, 13:00, 15:00, 17:00, 19:00)
    if (slots.length === 0) {
      const hours = [9, 11, 13, 15, 17, 19];
      const newSlotsData = hours.map((h) => {
        const slotStart = new Date(dateStr);
        slotStart.setHours(h, 0, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + 45);

        return {
          vanId: id,
          date: startDate,
          startTime: slotStart,
          endTime: slotEnd,
          isBooked: false,
        };
      });

      await db.availability.createMany({
        data: newSlotsData,
      });

      slots = await db.availability.findMany({
        where: whereClause,
        orderBy: {
          startTime: 'asc',
        },
      });
    }

    // Filter booked slots if not all requested
    const filteredSlots = all ? slots : slots.filter((s) => !s.isBooked);

    return NextResponse.json({
      success: true,
      slots: filteredSlots.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        isBooked: s.isBooked,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
