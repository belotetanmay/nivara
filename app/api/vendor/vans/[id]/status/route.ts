import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { VanStatus, VendorStatus } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // A vendor can only set listing active if the host profile is approved
    if (vendorProfile.verificationStatus !== VendorStatus.APPROVED) {
      return NextResponse.json({
        error: 'VENDOR_NOT_APPROVED',
        message: 'Your partner account must be vetted and approved by administrators before toggling listings active.',
      }, { status: 403 });
    }

    const van = await db.van.findUnique({
      where: { id },
    });

    if (!van || van.vendorId !== vendorProfile.id) {
      return NextResponse.json({ error: 'Van not found or unauthorized' }, { status: 404 });
    }

    // Toggle status between ACTIVE and INACTIVE
    const newStatus = van.status === VanStatus.ACTIVE ? VanStatus.INACTIVE : VanStatus.ACTIVE;

    await db.van.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      status: newStatus,
      message: `Van status successfully toggled to ${newStatus}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
