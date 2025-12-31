import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/directus/auth';
import { uploadAsset } from '@/lib/r2/client';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, filename } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const imageResponse = await fetch(url);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to download image: ${imageResponse.status}` },
        { status: 500 }
      );
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    let extension = 'jpg';
    if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('webp')) extension = 'webp';
    else if (contentType.includes('gif')) extension = 'gif';

    const timestamp = Date.now();
    const sanitizedFilename = filename
      ? filename.replace(/[^a-zA-Z0-9.-]/g, '_')
      : 'unsplash-image';
    const filename_with_timestamp = `${timestamp}-${sanitizedFilename}.${extension}`;
    const key = `blog/covers/${filename_with_timestamp}`;

    await uploadAsset(buffer, key, contentType);
    const assetUrl = `/api/assets/${key}`;

    return NextResponse.json({
      data: {
        key,
        url: assetUrl,
        originalUrl: url
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to upload asset from URL:', error);
    return NextResponse.json(
      { error: 'Failed to upload asset from URL', details: error.message },
      { status: 500 }
    );
  }
}
