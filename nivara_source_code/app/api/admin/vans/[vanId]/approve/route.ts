import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { VanStatus } from '@prisma/client';
import { logAdminAction } from '@/lib/services/audit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vanId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vanId } = await params;

    const van = await db.van.findUnique({
      where: { id: vanId },
    });

    if (!van) {
      return NextResponse.json({ error: 'Van listing not found' }, { status: 404 });
    }

    await db.van.update({
      where: { id: vanId },
      data: {
        status: VanStatus.ACTIVE,
      },
    });

    // Write audit log
    await logAdminAction(payload.userId, 'APPROVE_VAN', `Van:${vanId}`, `Approved Van listing: ${van.title}`);

    return NextResponse.json({
      success: true,
      message: 'Van listing approved and set active successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
