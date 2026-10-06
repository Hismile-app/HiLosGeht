import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const contentType = req.headers.get('content-type') || '';

    let buffer: Buffer;
    let filename: string;
    let mimeType: string = 'image/jpeg';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided in form data' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      filename = `proofs/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      mimeType = file.type || 'image/jpeg';
    } else {
      const body = await req.json();
      const { data, filename: customName, mime } = body;

      if (!data) {
        return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
      }

      // Handle data:image/png;base64,...
      let base64Data = data;
      if (data.includes(';base64,')) {
        const parts = data.split(';base64,');
        const mimeMatch = parts[0].match(/data:(.*?)$/);
        if (mimeMatch) mimeType = mimeMatch[1];
        base64Data = parts[1];
      } else if (mime) {
        mimeType = mime;
      }

      buffer = Buffer.from(base64Data, 'base64');
      const ext = mimeType.split('/')[1] || 'jpg';
      filename = `proofs/${Date.now()}-${customName || 'upload'}.${ext}`;
    }

    if (token) {
      // Upload to Vercel Private Blob Store
      const blob = await put(filename, buffer, {
        access: 'private',
        token,
        contentType: mimeType,
      });

      const viewUrl = `/api/v1/storage/view?url=${encodeURIComponent(blob.url)}`;

      return NextResponse.json({
        success: true,
        url: blob.url,
        viewUrl,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname,
        storageType: 'vercel-blob',
      }, { status: 201 });
    } else {
      // Fallback: return data URL if token not configured in environment
      const base64DataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      return NextResponse.json({
        success: true,
        url: base64DataUrl,
        viewUrl: base64DataUrl,
        storageType: 'inline-base64-fallback',
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
