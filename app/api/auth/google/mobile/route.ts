import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken, hashPassword } from '@/lib/auth';
import { Role, KYCStatus, VendorStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { idToken, email, name, role = 'CUSTOMER' } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required for Google authentication' }, { status: 400 });
    }

    const targetRole: Role = role.toUpperCase() === 'VENDOR' ? Role.VENDOR : Role.CUSTOMER;

    const dbUser = await db.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { email },
        include: { vendorProfile: true },
      });

      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-16);
        const passwordHash = await hashPassword(randomPassword);

        user = await tx.user.create({
          data: {
            name: name || 'Google User',
            email,
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
              bio: 'Wellness van host registered via Google Authentication.',
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
    console.error('[Google Mobile Auth Error]:', error);
    return NextResponse.json({ error: error.message || 'Google authentication failed' }, { status: 500 });
  }
}
