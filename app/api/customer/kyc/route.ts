import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { KYCStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { docType, docNumber, fileUrl } = await request.json();

    if (!docType || !docNumber || !fileUrl) {
      return NextResponse.json({ error: 'Document type, number, and file are required' }, { status: 400 });
    }

    // Mask the doc number at rest
    const maskedNumber = docNumber.length > 4 
      ? '*'.repeat(docNumber.length - 4) + docNumber.slice(-4) 
      : docNumber;

    // Create KYC Document and update user status in a transaction
    await db.$transaction(async (tx) => {
      await tx.kYCDocument.create({
        data: {
          userId: payload.userId,
          docType,
          docNumber: maskedNumber,
          fileUrl,
          status: KYCStatus.PENDING,
        },
      });

      await tx.user.update({
        where: { id: payload.userId },
        data: { kycStatus: KYCStatus.PENDING },
      });
    });

    return NextResponse.json({ success: true, message: 'KYC documents submitted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
