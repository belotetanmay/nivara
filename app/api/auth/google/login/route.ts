import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'CUSTOMER';

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret || clientId.includes('Mock') || clientId.startsWith('AIzaSyMock')) {
    // Redirect back to login with a config error hint
    return NextResponse.redirect(new URL('/login?error=google_config_missing', request.url));
  }

  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
  const appUrl = `${protocol}://${host}`;
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
