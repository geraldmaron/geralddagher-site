import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

let clientInstance: S3Client | null = null;

function getR2Client(): S3Client {
  if (!clientInstance) {
    if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY || !process.env.R2_SECRET_KEY) {
      throw new Error('R2 credentials not configured');
    }

    clientInstance = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
      },
    });
  }
  return clientInstance;
}

function getR2Path(pathSegments: string[]): string {
  const key = pathSegments.join('/');

  if (key.startsWith('blog/') || key.startsWith('site-assets/') ||
      key.startsWith('user-uploads/') || key.startsWith('documents/') ||
      key.startsWith('argus/') || key.startsWith('directus/')) {
    return key;
  }

  const filename = pathSegments[pathSegments.length - 1];

  if (filename.match(/^\d{13}-/)) {
    return `blog/covers/${filename}`;
  }

  if (filename === 'Gerald-Dagher-Product-Management-Resume.pdf') {
    return `documents/${filename}`;
  }

  return key;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;

    if (!path || path.length === 0) {
      return new NextResponse('Invalid asset path', { status: 400 });
    }

    const client = getR2Client();
    const bucket = process.env.R2_BUCKET || 'cms-assets';
    const r2Path = getR2Path(path);

    const possibleKeys = r2Path.startsWith('directus/')
      ? [r2Path]
      : [r2Path, `directus/${r2Path}`];

    let response: any = null;
    let lastError: any = null;
    let finalKey = r2Path;

    for (const tryKey of possibleKeys) {
      try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: tryKey,
        });

        const result = await client.send(command);
        response = result;
        finalKey = tryKey;
        break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!response) {
      if (lastError?.name === 'NoSuchKey' || lastError?.$metadata?.httpStatusCode === 404) {
        return new NextResponse('Asset not found', { status: 404 });
      }
      throw lastError || new Error('Failed to retrieve asset');
    }

    if (!response.Body) {
      return new NextResponse('Asset not found', { status: 404 });
    }

    const body = await response.Body.transformToByteArray();

    let contentType = response.ContentType || 'application/octet-stream';

    if (contentType === 'application/octet-stream') {
      const extension = finalKey.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'avif': 'image/avif',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mp3': 'audio/mpeg',
        'pdf': 'application/pdf',
      };
      if (extension && mimeTypes[extension]) {
        contentType = mimeTypes[extension];
      }
    }

    return new NextResponse(Buffer.from(body), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error: any) {
    console.error('Error serving asset:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      statusCode: error.$metadata?.httpStatusCode,
      key: (error as any).Key
    });
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return new NextResponse('Asset not found', { status: 404 });
    }
    return new NextResponse('Error serving asset', { status: 500 });
  }
}
