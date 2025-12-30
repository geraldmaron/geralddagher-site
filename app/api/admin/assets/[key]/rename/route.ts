import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/directus/auth';
import { S3Client, CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_KEY || '',
  },
});

const BUCKET = process.env.R2_BUCKET || 'cms-assets';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key } = await params;
    const { newName } = await req.json();

    if (!key || !newName) {
      return NextResponse.json({ error: 'Key and newName are required' }, { status: 400 });
    }

    const oldKey = decodeURIComponent(key);
    const extension = oldKey.split('.').pop();
    const newKey = newName.endsWith(`.${extension}`) ? newName : `${newName}.${extension}`;

    const headResult = await client.send(new HeadObjectCommand({
      Bucket: BUCKET,
      Key: oldKey,
    }));

    await client.send(new CopyObjectCommand({
      Bucket: BUCKET,
      CopySource: `${BUCKET}/${oldKey}`,
      Key: newKey,
      ContentType: headResult.ContentType,
      MetadataDirective: 'COPY',
    }));

    await client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: oldKey,
    }));

    return NextResponse.json({
      success: true,
      oldKey,
      newKey
    });
  } catch (error: any) {
    console.error('Error renaming asset:', error);
    return NextResponse.json(
      { error: 'Failed to rename asset', details: error.message },
      { status: 500 }
    );
  }
}
