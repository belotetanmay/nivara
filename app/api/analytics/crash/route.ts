import { NextResponse } from 'next/server';
import { captureException } from '@/lib/services/crashReporter';

export async function POST(request: Request) {
  try {
    const { message, stack, componentName } = await request.json();
    captureException({ message, stack }, { componentName, platform: 'mobile' });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
