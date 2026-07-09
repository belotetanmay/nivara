import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VanStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const van = await db.van.findFirst({
      where: {
        id,
        status: VanStatus.ACTIVE,
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            bio: true,
            ratingAvg: true,
            verificationStatus: true,
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!van) {
      return NextResponse.json({ error: 'Van not found or inactive' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      van,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
