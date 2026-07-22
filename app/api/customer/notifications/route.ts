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

    // Retrieve notifications
    let notifications = await db.notification.findMany({
      where: {
        userId: payload.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Seed default welcome notifications if empty
    if (notifications.length === 0) {
      await db.notification.createMany({
        data: [
          {
            userId: payload.userId,
            title: 'Welcome to Nivara!',
            message: 'Discover premium mobile wellness sanctuaries near you. Start by browsing available vans on the Explore tab.',
            isRead: false,
          },
          {
            userId: payload.userId,
            title: 'Refuel Wallet Active',
            message: 'Your wallet is seeded with ₹2,500.00 complimentary balance to help you book your first session.',
            isRead: false,
          },
        ],
      });

      notifications = await db.notification.findMany({
        where: {
          userId: payload.userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, markAllAllRead } = await request.json().catch(() => ({}));

    if (markAllAllRead) {
      await db.notification.updateMany({
        where: {
          userId: payload.userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    } else if (id) {
      await db.notification.update({
        where: {
          id,
          userId: payload.userId,
        },
        data: {
          isRead: true,
        },
      });
    } else {
      return NextResponse.json({ error: 'Notification ID or markAllAllRead is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
