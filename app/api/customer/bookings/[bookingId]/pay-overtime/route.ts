import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify booking ownership
    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
        customerId: payload.userId,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Mark overtime charges as paid
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        overtimeStatus: 'PAID',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Overtime payment completed successfully.',
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error('Error completing overtime payment:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
