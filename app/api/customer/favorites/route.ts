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

    const favorites = await db.favorite.findMany({
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
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      favorites: favorites.map((f) => f.vendor),
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

    // Verify vendor profile exists
    const vendor = await db.vendorProfile.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // Create favorite (upsert-like behavior to prevent duplicate errors)
    const favorite = await db.favorite.upsert({
      where: {
        userId_vendorId: {
          userId: payload.userId,
          vendorId,
        },
      },
      create: {
        userId: payload.userId,
        vendorId,
      },
      update: {}, // No updates if already favorited
    });

    return NextResponse.json({
      success: true,
      favorite,
      message: 'Vendor added to favorites successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId search parameter is required' }, { status: 400 });
    }

    await db.favorite.deleteMany({
      where: {
        userId: payload.userId,
        vendorId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor removed from favorites successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
