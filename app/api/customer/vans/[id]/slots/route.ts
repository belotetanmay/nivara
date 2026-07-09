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

    const whereClause: any = {
      vanId: id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    // If not requesting all slots, only return unbooked ones
    if (!all) {
      whereClause.isBooked = false;
    }

    const slots = await db.availability.findMany({
      where: whereClause,
      orderBy: {
        startTime: 'asc',
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        isBooked: true,
      },
    });

    return NextResponse.json({
      success: true,
      slots,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
