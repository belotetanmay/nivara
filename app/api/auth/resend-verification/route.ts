import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetOtp } from '@/lib/services/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await db.$transaction([
      db.verificationToken.deleteMany({ where: { email } }),
      db.verificationToken.create({
        data: {
          email,
          token: otp,
          expires,
        },
      }),
    ]);

    await sendPasswordResetOtp(email, otp);

    return NextResponse.json({
      success: true,
      message: 'Verification code re-sent successfully.',
    });
  } catch (error: any) {
    console.error('[Resend Verification Error]:', error);
    return NextResponse.json({ error: 'Failed to resend verification email' }, { status: 500 });
  }
}
