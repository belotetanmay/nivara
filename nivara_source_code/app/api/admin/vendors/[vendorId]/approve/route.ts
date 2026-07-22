import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { VendorStatus } from '@prisma/client';
import { logAdminAction } from '@/lib/services/audit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vendorId } = await params;

    const vendor = await db.vendorProfile.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    await db.vendorProfile.update({
      where: { id: vendorId },
      data: {
        verificationStatus: VendorStatus.APPROVED,
        rejectionReason: null,
      },
    });

    // Write audit log
    await logAdminAction(payload.userId, 'APPROVE_VENDOR', `VendorProfile:${vendorId}`, `Approved Vendor Host Profile ${vendor.businessName}`);

    return NextResponse.json({
      success: true,
      message: 'Vendor application approved successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
