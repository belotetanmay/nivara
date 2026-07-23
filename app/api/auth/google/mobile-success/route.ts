import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const role = searchParams.get('role') || '';

  const deepLink = `nivara://login-success?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Sign-In Successful</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #FAF8F5; text-align: center; }
    .card { background: white; padding: 32px 24px; border-radius: 20px; border: 1px solid #E5E1D8; max-width: 320px; width: 90%; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .icon { font-size: 40px; margin-bottom: 12px; }
    h2 { color: #0F2D52; margin: 0 0 8px 0; font-size: 20px; font-weight: 700; }
    p { color: #6B7280; font-size: 13px; margin: 0 0 20px 0; line-height: 1.5; }
    .btn { display: inline-block; background: #0F2D52; color: white; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; border: none; cursor: pointer; width: 100%; box-sizing: border-box; }
    .btn:active { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✨</div>
    <h2>Authenticated with Google</h2>
    <p>Signed in as <strong>${email || 'User'}</strong>.<br/>Close this window or tap below to return to NIVARA.</p>
    <a href="${deepLink}" class="btn" onclick="window.close()">Return to NIVARA App</a>
  </div>
  <script>
    // Auto-trigger deep link redirect to return to Expo app automatically
    window.location.href = "${deepLink}";
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
