import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recentlyViewed = await db.recentlyViewed.findMany({
      where: {
        userId: payload.userId,
      },
      include: {
        vendor: {
          include: {
            vans: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: {
        viewedAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      recentlyViewed: recentlyViewed.map((rv) => rv.vendor),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vendorId } = await request.json();
    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 });
    }

    // Verify vendor exists
    const vendor = await db.vendorProfile.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // Log the viewed item
    await db.recentlyViewed.upsert({
      where: {
        userId_vendorId: {
          userId: payload.userId,
          vendorId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        userId: payload.userId,
        vendorId,
      },
    });

    // Bounded cleanup: Delete any logs outside the top 10
    const logs = await db.recentlyViewed.findMany({
      where: { userId: payload.userId },
      orderBy: { viewedAt: 'desc' },
      select: { id: true },
    });

    if (logs.length > 10) {
      const extraIds = logs.slice(10).map((l) => l.id);
      await db.recentlyViewed.deleteMany({
        where: {
          id: {
            in: extraIds,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
