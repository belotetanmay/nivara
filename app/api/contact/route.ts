import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const contact = await db.contactMessage.create({
      data: {
        name,
        email,
        message,
      },
    });

    // Logging simulated email dispatch for support team notification
    console.log(`[Email Notification Dispatch] To: support.nivara@gmail.com | Subject: New Contact Inquiry | Body: ${name} (${email}) says: ${message}`);

    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
