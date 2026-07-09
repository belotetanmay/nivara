import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VanStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await params;

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: {
            name: true,
            createdAt: true,
          },
        },
      },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // Get active vans
    const vans = await db.van.findMany({
      where: {
        vendorId,
        status: VanStatus.ACTIVE,
      },
    });

    // Get last 20 reviews for this vendor's vans
    const reviews = await db.review.findMany({
      where: {
        van: {
          vendorId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        van: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      vendorProfile,
      vans,
      reviews,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
