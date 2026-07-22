import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    // Retrieve verification token
    const tokenRecord = await db.verificationToken.findFirst({
      where: {
        email,
        token: code,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid verification code. Please check your email and try again.' }, { status: 400 });
    }

    // Check expiration
    if (new Date() > new Date(tokenRecord.expires)) {
      await db.verificationToken.deleteMany({
        where: { email },
      });
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Failed to verify verification code' }, { status: 500 });
  }
}
