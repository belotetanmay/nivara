import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get count of active vans
    const activeVansCount = await db.van.count({
      where: {
        status: 'ACTIVE'
      }
    });

    // 2. Get count of completed sessions (bookings with status COMPLETED)
    const completedSessionsCount = await db.booking.count({
      where: {
        status: 'COMPLETED'
      }
    });

    // 3. Calculate average review rating
    const reviews = await db.review.aggregate({
      _avg: {
        rating: true
      }
    });
    
    const averageRating = reviews._avg.rating ? Number(reviews._avg.rating.toFixed(1)) : 0.0;

    // 4. Get last 3 high-rating reviews from database for lander feedback section
    const dbReviews = await db.review.findMany({
      where: {
        rating: { gte: 4 }
      },
      take: 3,
      orderBy: {
        id: 'desc'
      },
      include: {
        booking: {
          include: {
            customer: {
              select: {
                name: true
              }
            }
          }
        },
        van: {
          select: {
            address: true
          }
        }
      }
    });

    const reviewsList = dbReviews.map((r: any) => ({
      quote: r.comment,
      name: r.booking.customer.name,
      roleCity: r.van.address.split(',')[1]?.trim() || 'Mumbai',
      rating: r.rating
    }));

    return NextResponse.json({
      success: true,
      activeVans: activeVansCount,
      completedSessions: completedSessionsCount,
      averageRating: averageRating,
      reviews: reviewsList
    });
  } catch (error: any) {
    console.error('Error fetching public stats:', error);
    // Graceful fallback to zeros so it doesn't crash the frontend landing page
    return NextResponse.json({
      success: false,
      activeVans: 0,
      completedSessions: 0,
      averageRating: 0.0,
      reviews: []
    });
  }
}
