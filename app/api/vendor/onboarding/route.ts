import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { VendorStatus, KYCStatus } from '@prisma/client';

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

    const { businessName, bio, payoutDetails, licenseDocUrl } = await request.json();

    if (!businessName || !payoutDetails || !licenseDocUrl) {
      return NextResponse.json({ error: 'Business name, payout details, and document are required' }, { status: 400 });
    }

    // Run transaction
    await db.$transaction(async (tx) => {
      // 1. Update Vendor Profile
      await tx.vendorProfile.update({
        where: { userId: payload.userId },
        data: {
          businessName,
          bio: bio || '',
          payoutDetails,
          verificationStatus: VendorStatus.PENDING,
          rejectionReason: null, // Clear old rejection logs
        },
      });

      // 2. Log host license in KYCDocument
      await tx.kYCDocument.create({
        data: {
          userId: payload.userId,
          docType: 'BUSINESS_LICENSE',
          docNumber: 'VETTING-LICENSE-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
          fileUrl: licenseDocUrl,
          status: KYCStatus.PENDING,
        },
      });

      // 3. Reset User KYC Status to pending review
      await tx.user.update({
        where: { id: payload.userId },
        data: {
          kycStatus: KYCStatus.PENDING,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding profile resubmitted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
