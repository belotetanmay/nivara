import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { KYCStatus, VendorStatus, Role } from '@prisma/client';
import { logAdminAction } from '@/lib/services/audit';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId } = await params;

    const userToUpdate = await db.user.findUnique({
      where: { id: userId },
      include: {
        vendorProfile: true,
      },
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userToUpdate.role === Role.ADMIN) {
      return NextResponse.json({ error: 'Cannot suspend an administrator account' }, { status: 400 });
    }

    let statusMsg = '';

    await db.$transaction(async (tx) => {
      if (userToUpdate.role === Role.VENDOR && userToUpdate.vendorProfile) {
        const currentStatus = userToUpdate.vendorProfile.verificationStatus;
        const newStatus = currentStatus === VendorStatus.SUSPENDED 
          ? VendorStatus.APPROVED 
          : VendorStatus.SUSPENDED;

        await tx.vendorProfile.update({
          where: { id: userToUpdate.vendorProfile.id },
          data: { verificationStatus: newStatus },
        });

        statusMsg = newStatus === VendorStatus.SUSPENDED ? 'suspended' : 'activated';
      } else {
        // Customer kycStatus toggle to REJECTED (block) or VERIFIED
        const currentKyc = userToUpdate.kycStatus;
        const newKyc = currentKyc === KYCStatus.REJECTED 
          ? KYCStatus.VERIFIED 
          : KYCStatus.REJECTED;

        await tx.user.update({
          where: { id: userId },
          data: { kycStatus: newKyc },
        });

        statusMsg = newKyc === KYCStatus.REJECTED ? 'suspended/blocked' : 'activated';
      }
    });

    // Write audit log
    await logAdminAction(payload.userId, 'SUSPEND_USER', `User:${userId}`, `Toggled user suspension state. Status set to: ${statusMsg}`);

    return NextResponse.json({
      success: true,
      message: `User successfully ${statusMsg}`,
    });
  } catch (error: any) {
    console.error('Admin user suspend error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected internal error occurred.' }, { status: 500 });
  }
}
