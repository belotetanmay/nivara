import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, code, password } = await request.json();

    if (!email || !code || !password) {
      return NextResponse.json({ error: 'Email, code, and new password are required' }, { status: 400 });
    }

    // Double check token validity
    const tokenRecord = await db.verificationToken.findFirst({
      where: {
        email,
        token: code,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Verification code is invalid or has expired' }, { status: 400 });
    }

    if (new Date() > new Date(tokenRecord.expires)) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // Validation password strength
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return NextResponse.json({ error: 'Password must contain both letters and numbers.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Update user password and clear token in a transaction
    await db.$transaction([
      db.user.update({
        where: { email },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockoutUntil: null,
        },
      }),
      db.verificationToken.deleteMany({
        where: { email },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password. Please try again.' }, { status: 500 });
  }
}
