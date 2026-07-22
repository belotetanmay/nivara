import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = verifyToken(tokenCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique name
    const uniqueSuffix = Math.random().toString(36).substring(2, 9);
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}_${uniqueSuffix}_${cleanFileName}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        // Try uploading to 'uploads' bucket in Supabase storage
        const uploadUrl = `${supabaseUrl}/storage/v1/object/uploads/${filename}`;
        let uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: buffer,
        });

        // If bucket doesn't exist, try to create it and retry upload
        if (uploadRes.status === 404 || uploadRes.status === 400) {
          const createBucketUrl = `${supabaseUrl}/storage/v1/bucket`;
          const createRes = await fetch(createBucketUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: 'uploads',
              name: 'uploads',
              public: true,
              file_size_limit: 52428800, // 50MB
            }),
          });

          if (createRes.ok) {
            // Retry upload
            uploadRes = await fetch(uploadUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': file.type || 'application/octet-stream',
              },
              body: buffer,
            });
          }
        }

        if (uploadRes.ok) {
          const fileUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${filename}`;
          return NextResponse.json({
            success: true,
            fileUrl,
          });
        }
      } catch (storageError) {
        console.error('Supabase storage upload error:', storageError);
      }
    }

    // Fallback: Base64 data URL (works 100% serverless without write/read filesystem)
    const base64Data = buffer.toString('base64');
    const fileUrl = `data:${file.type || 'image/png'};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      fileUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
