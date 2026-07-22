import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json({ authenticated: false, error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, error: 'Invalid token' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: {
        vendorProfile: true,
        kycDocuments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, error: 'User not found' }, { status: 401 });
    }

    // Exclude passwordHash
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json({
      authenticated: true,
      user: safeUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
