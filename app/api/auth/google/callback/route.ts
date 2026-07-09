import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { signToken, hashPassword } from '@/lib/auth';
import { Role, KYCStatus, VendorStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || 'CUSTOMER'; // State stores the role ('CUSTOMER' or 'VENDOR')

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=google_code_missing', request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
  const appUrl = `${protocol}://${host}`;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  try {
    // 1. Exchange auth code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Google token exchange error:', errText);
      return NextResponse.redirect(new URL('/login?error=google_token_exchange_failed', request.url));
    }

    const tokenData = await tokenRes.json();
    
    // 2. Fetch user profile information using access token
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(new URL('/login?error=google_profile_fetch_failed', request.url));
    }

    const userInfo = await userInfoRes.json();
    const { email, name, picture } = userInfo;

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=google_email_missing', request.url));
    }

    // Determine target signup role from OAuth state parameter
    const targetRole: Role = state.toUpperCase() === 'VENDOR' ? Role.VENDOR : Role.CUSTOMER;

    // 3. User lookup & registration transaction
    const dbUser = await db.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { email },
        include: { vendorProfile: true }
      });

      if (!user) {
        // Create new user since it is a first-time sign-up
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
          include: { vendorProfile: true }
        });

        // If the signing up role is VENDOR, also seed their VendorProfile
        if (targetRole === Role.VENDOR) {
          const profile = await tx.vendorProfile.create({
            data: {
              userId: user.id,
              businessName: `${user.name}'s Wellness Pods`,
              bio: 'Wellness van host registered via Google Authentication.',
              verificationStatus: VendorStatus.PENDING,
              payoutDetails: 'Not configured yet. Configure bank account details in settings.',
            }
          });
          user.vendorProfile = profile;
        }
      }

      return user;
    });

    // 4. Issue custom JWT authentication token
    const token = signToken({
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    });

    // 5. Establish secure session cookie & redirect
    let dashboardPath = '/customer/dashboard';
    if (dbUser.role === Role.ADMIN) {
      dashboardPath = '/admin/dashboard';
    } else if (dbUser.role === Role.VENDOR) {
      dashboardPath = dbUser.vendorProfile?.verificationStatus === VendorStatus.APPROVED
        ? '/vendor/dashboard'
        : '/vendor/onboarding';
    }

    const response = NextResponse.redirect(new URL(dashboardPath, request.url));
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('Unhandled Google OAuth error:', error);
    return NextResponse.redirect(new URL(`/login?error=google_auth_unhandled&msg=${encodeURIComponent(error.message || '')}`, request.url));
  }
}
