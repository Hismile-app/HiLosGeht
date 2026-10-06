import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blobUrl = searchParams.get('url');

    if (!blobUrl) {
      return NextResponse.json({ error: 'Missing url query parameter' }, { status: 400 });
    }

    // If it's already a data URL or external asset, redirect or return
    if (blobUrl.startsWith('data:')) {
      return new NextResponse('Inline data', { status: 200 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not configured' }, { status: 500 });
    }

    const blobResponse = await get(blobUrl, { access: 'private', token });
    if (!blobResponse || !blobResponse.stream) {
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });
    }

    const contentType = blobResponse.headers.get('content-type') || 'application/octet-stream';

    // Stream the private blob to the client with caching headers
    return new NextResponse(blobResponse.stream as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Error streaming blob:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
