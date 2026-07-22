import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    latestVersion: '1.0.0',
    minRequiredVersion: '1.0.0',
    forceUpdate: false,
    updateUrl: 'https://nivara-ten.vercel.app',
    releaseNotes: 'Performance optimizations, enhanced Google & Apple authentication, and push notifications.',
  });
}
