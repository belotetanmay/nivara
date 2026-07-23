import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const role = searchParams.get('role') || '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Sign-In Successful</title>
  <style>
    body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #FAF8F5; text-align: center; }
    .card { background: white; padding: 32px; border-radius: 20px; border: 1px solid #E5E1D8; max-width: 320px; width: 90%; }
    .icon { font-size: 40px; margin-bottom: 12px; }
    h2 { color: #0F2D52; margin: 0 0 8px 0; font-size: 20px; }
    p { color: #6B7280; font-size: 14px; margin: 0 0 16px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✨</div>
    <h2>Authenticated with Google</h2>
    <p>Returning to NIVARA app as <strong>${email}</strong>...</p>
  </div>
  <script>
    // Redirect to app scheme or signal completion
    window.location.hash = "token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}";
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
