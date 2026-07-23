import { NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/services/razorpay';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, amount } = await request.json();

    if (!bookingId || !amount) {
      return NextResponse.json({ error: 'bookingId and amount are required' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { van: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const orderResult = await createRazorpayOrder({
      amount: Number(amount),
      currency: 'INR',
      receipt: `rcpt_${bookingId.substring(0, 10)}`,
      notes: {
        bookingId,
        vanTitle: booking.van?.title || 'NIVARA Wellness Van',
        customerId: payload.userId,
      },
    });

    return NextResponse.json({
      success: true,
      order: orderResult.order,
      keyId: orderResult.key_id,
    });
  } catch (error: any) {
    console.error('[Create Razorpay Order Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to create Razorpay order' }, { status: 500 });
  }
}
