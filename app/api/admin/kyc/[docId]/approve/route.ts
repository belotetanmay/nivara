import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { KYCStatus } from '@prisma/client';
import { logAdminAction } from '@/lib/services/audit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { docId } = await params;

    const doc = await db.kYCDocument.findUnique({
      where: { id: docId },
    });

    if (!doc) {
      return NextResponse.json({ error: 'KYC Document not found' }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // 1. Update doc status
      await tx.kYCDocument.update({
        where: { id: docId },
        data: {
          status: KYCStatus.VERIFIED,
          reviewedBy: payload.userId,
          reviewedAt: new Date(),
        },
      });

      // 2. Update user status
      await tx.user.update({
        where: { id: doc.userId },
        data: {
          kycStatus: KYCStatus.VERIFIED,
        },
      });
    });

    // Write audit log
    await logAdminAction(payload.userId, 'APPROVE_KYC', `User:${doc.userId}`, `Approved KYC Document ${docId}`);

    return NextResponse.json({
      success: true,
      message: 'KYC document verified successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
