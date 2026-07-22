import { NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pushToken } = await request.json();

    if (!pushToken) {
      return NextResponse.json({ error: 'Push token is required' }, { status: 400 });
    }

    console.log(`[Push Token Registered]: User=${payload.userId} Token=${pushToken.substring(0, 20)}...`);

    return NextResponse.json({
      success: true,
      message: 'Push notification token registered successfully.',
    });
  } catch (error: any) {
    console.error('[Push Token Error]:', error);
    return NextResponse.json({ error: 'Failed to register push token' }, { status: 500 });
  }
}
