import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { Role, KYCStatus, VendorStatus } from '@prisma/client';
import { sendAdminApprovalNotification } from '@/lib/services/email';

export async function POST(request: Request) {
  try {
    const { name, email, phone, password, role, businessName, bio, payoutDetails } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password, and role are required' }, { status: 400 });
    }

    if (role !== 'CUSTOMER' && role !== 'VENDOR') {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address format.' }, { status: 400 });
    }

    // Password strength complexity validation
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return NextResponse.json({ error: 'Password security constraint: Must contain both letters and numbers.' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Create user and profile if vendor in transaction
    const user = await db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          role: role as Role,
          kycStatus: KYCStatus.UNVERIFIED,
        },
      });

      if (role === 'VENDOR') {
        await tx.vendorProfile.create({
          data: {
            userId: createdUser.id,
            businessName: businessName || `${name}'s Wellness Pods`,
            bio: bio || 'No biography provided yet.',
            verificationStatus: VendorStatus.PENDING,
            payoutDetails: payoutDetails || 'No payout details provided.',
          },
        });
      }

      return createdUser;
    });

    if (role === 'VENDOR') {
      const bName = businessName || `${name}'s Wellness Pods`;
      sendAdminApprovalNotification(name, bName, email).catch(err => {
        console.error('Failed to send admin email alert:', err);
      });
    }

    // Sign JWT Token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
      },
    });

    // Set Cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
