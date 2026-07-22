import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { KYCStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and verification token are required' }, { status: 400 });
    }

    const verificationRecord = await db.verificationToken.findFirst({
      where: {
        email,
        token,
      },
    });

    if (!verificationRecord) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 });
    }

    if (verificationRecord.expires < new Date()) {
      return NextResponse.json({ error: 'Verification token has expired' }, { status: 400 });
    }

    // Update user status and delete token
    await db.$transaction([
      db.user.updateMany({
        where: { email },
        data: { kycStatus: KYCStatus.VERIFIED },
      }),
      db.verificationToken.deleteMany({
        where: { email },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Email address verified successfully!',
    });
  } catch (error: any) {
    console.error('[Verify Email Error]:', error);
    return NextResponse.json({ error: 'Failed to verify email address' }, { status: 500 });
  }
}
