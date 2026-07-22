import { NextResponse } from 'next/server';
import { logAnalyticsEvent } from '@/lib/services/analytics';
import { extractToken, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { event, properties } = await request.json();
    const token = extractToken(request);
    const payload = token ? verifyToken(token) : null;

    logAnalyticsEvent({
      event,
      userId: payload?.userId,
      properties,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
