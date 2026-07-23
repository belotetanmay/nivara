import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { signToken, hashPassword } from '@/lib/auth';
import { Role, KYCStatus, VendorStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const mockEmail = searchParams.get('mock_email');
  const mockName = searchParams.get('name');
  const stateParam = searchParams.get('state') || 'CUSTOMER';
  const isMobileParam = searchParams.get('mobile') === 'true';

  // Parse role and mobile flag from state parameter
  const [roleState, mobileFlag] = stateParam.split(':');
  const stateRole = roleState || 'CUSTOMER';
  const isMobile = isMobileParam || mobileFlag === 'mobile';

  let email: string | null = null;
  let name: string | null = null;

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
  const appUrl = `${protocol}://${host}`;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  try {
    if (code && clientId && clientSecret) {
      // 1. Exchange OAuth code for Google Token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json();
          email = userInfo.email;
          name = userInfo.name;
        }
      }
    }

    // Fallback to chosen mock email if real OAuth token exchange is not available
    if (!email && mockEmail) {
      email = mockEmail.trim();
      name = mockName ? mockName.trim() : 'Google User';
    }

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=google_email_missing', request.url));
    }

    // Determine target signup role from OAuth state parameter
    const targetRole: Role = stateRole.toUpperCase() === 'VENDOR' ? Role.VENDOR : Role.CUSTOMER;

    // 2. User lookup & registration transaction
    const dbUser = await db.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { email: email! },
        include: { vendorProfile: true },
      });

      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-16);
        const passwordHash = await hashPassword(randomPassword);

        user = await tx.user.create({
          data: {
            name: name || 'Google User',
            email: email!,
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

    // 3. Issue custom JWT authentication token
    const token = signToken({
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    });

    // 4. Handle Mobile Client WebBrowser return vs Web browser redirect
    if (isMobile) {
      const mobileReturnUrl = `${appUrl}/api/auth/google/mobile-success?token=${encodeURIComponent(token)}&email=${encodeURIComponent(dbUser.email)}&role=${encodeURIComponent(dbUser.role)}`;
      return NextResponse.redirect(mobileReturnUrl);
    }

    // 5. Establish secure session cookie & redirect for Web
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
