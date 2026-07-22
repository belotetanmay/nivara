import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetOtp } from '@/lib/services/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success anyway for security / timing side-channel protection (or return error if wanted, but returning success is standard. Wait! The user's mock code says: email "error@nivara.com" yields an error. So we can check if they exist and return error if they don't, since it's a closed corporate / specialized app)
      return NextResponse.json({ error: 'An account with this email address does not exist.' }, { status: 404 });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // Save token to database
    await db.$transaction([
      // Delete old tokens
      db.verificationToken.deleteMany({
        where: { email },
      }),
      // Create new token
      db.verificationToken.create({
        data: {
          email,
          token: otp,
          expires,
        },
      }),
    ]);

    // Send email
    await sendPasswordResetOtp(email, otp);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process password recovery request' }, { status: 500 });
  }
}
