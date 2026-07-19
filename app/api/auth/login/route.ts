import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Validate email format on server-side
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if account is currently locked out
    if (user.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
      const lockRemaining = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / 60000);
      return NextResponse.json({ 
        error: `Account locked due to too many failed login attempts. Try again in ${lockRemaining} minute(s).` 
      }, { status: 403 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    
    if (!isMatch) {
      // Increment failed attempts
      const newAttempts = user.failedLoginAttempts + 1;
      const isLocking = newAttempts >= 5;
      const lockoutUntil = isLocking ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await db.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockoutUntil
        }
      });

      if (isLocking) {
        return NextResponse.json({ 
          error: 'Too many failed login attempts. Your account has been temporarily locked for 15 minutes.' 
        }, { status: 403 });
      }

      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Success: Reset failed login attempts and lockout
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockoutUntil: null
      }
    });

    // Sign JWT Token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove token from JSON body response (Medium Issue 11) for cryptographic security
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
    return NextResponse.json({ error: 'An internal authentication error occurred.' }, { status: 500 });
  }
}
