import { NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/services/location';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address query parameter is required' }, { status: 400 });
    }

    const coords = await geocodeAddress(address);
    if (coords.error) {
      return NextResponse.json({ error: coords.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      ...coords,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
