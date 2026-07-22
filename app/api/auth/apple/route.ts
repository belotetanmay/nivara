import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, hashPassword } from '@/lib/auth';
import { Role, KYCStatus, VendorStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { identityToken, email, name, userIdentifier, role = 'CUSTOMER' } = await request.json();

    const userEmail = email || `${userIdentifier || Math.random().toString(36).slice(-8)}@apple-privaterelay.appleid.com`;
    const targetRole: Role = role.toUpperCase() === 'VENDOR' ? Role.VENDOR : Role.CUSTOMER;

    const dbUser = await db.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { email: userEmail },
        include: { vendorProfile: true },
      });

      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-16);
        const passwordHash = await hashPassword(randomPassword);

        user = await tx.user.create({
          data: {
            name: name || 'Apple User',
            email: userEmail,
            passwordHash,
            role: targetRole,
            kycStatus: KYCStatus.UNVERIFIED,
          },
          include: { vendorProfile: true },
        });

        if (targetRole === Role.VENDOR) {
          const profile = await tx.vendorProfile.create({
            data: {
              userId: user.id,
              businessName: `${user.name}'s Wellness Pods`,
              bio: 'Wellness van host registered via Apple Sign-In.',
              verificationStatus: VendorStatus.PENDING,
              payoutDetails: 'Not configured yet. Configure bank account details in settings.',
            },
          });
          user.vendorProfile = profile;
        }
      }

      return user;
    });

    const token = signToken({
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        kycStatus: dbUser.kycStatus,
      },
    });
  } catch (error: any) {
    console.error('[Apple Auth Error]:', error);
    return NextResponse.json({ error: error.message || 'Apple Sign-In failed' }, { status: 500 });
  }
}
