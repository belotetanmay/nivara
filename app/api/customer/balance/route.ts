import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { walletBalance: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      balance: user.walletBalance,
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

    const { amount } = await request.json();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: payload.userId },
      data: {
        walletBalance: {
          increment: parsedAmount,
        },
      },
      select: { walletBalance: true },
    });

    return NextResponse.json({
      success: true,
      balance: updatedUser.walletBalance,
      message: `Successfully refueled ₹${parsedAmount} to your Nivara Balance.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
