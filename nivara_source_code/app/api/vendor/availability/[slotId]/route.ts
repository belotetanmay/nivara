import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slotId: string }> }
) {
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

    const { slotId } = await params;

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    const slot = await db.availability.findUnique({
      where: { id: slotId },
      include: {
        van: true,
      },
    });

    if (!slot || slot.van.vendorId !== vendorProfile.id) {
      return NextResponse.json({ error: 'Slot not found or unauthorized' }, { status: 404 });
    }

    if (slot.isBooked) {
      return NextResponse.json({ error: 'Booked time slots cannot be deleted' }, { status: 400 });
    }

    await db.availability.delete({
      where: { id: slotId },
    });

    return NextResponse.json({
      success: true,
      message: 'Time slot deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
