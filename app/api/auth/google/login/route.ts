import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'CUSTOMER';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.includes('Mock') || clientId.startsWith('AIzaSyMock')) {
    // Redirect back to login with a config error hint
    return NextResponse.redirect(new URL('/login?error=google_config_missing', request.url));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // Construct Google Auth URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.append('client_id', clientId);
  googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.append('response_type', 'code');
  googleAuthUrl.searchParams.append('scope', 'openid email profile');
  googleAuthUrl.searchParams.append('state', role);
  googleAuthUrl.searchParams.append('prompt', 'select_account');

  return NextResponse.redirect(googleAuthUrl.toString());
}
