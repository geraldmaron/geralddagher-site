import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/directus/auth';
import { listAssets, uploadAsset, deleteAsset, getPublicAssetUrl } from '@/lib/r2/client';
import { getAssetType } from '@/lib/utils/asset-types';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const assets = await listAssets();

    const formatted = assets
      .filter(asset => {
        const key = asset.Key || '';
        return !key.includes('__') && !key.startsWith('test/');
      })
      .map((asset) => {
        const key = asset.Key || '';
        const mimeType = undefined;
        const url = `/api/assets/${key}`;
        return {
          key,
          size: asset.Size || 0,
          lastModified: asset.LastModified,
          url,
          type: getAssetType(key, mimeType),
          mimeType
        };
      });

    return NextResponse.json({ data: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to load assets', data: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    const key = `blog/covers/${filename}`;
    const url = await uploadAsset(buffer, key, file.type);

    return NextResponse.json({ data: { key, url } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to upload asset' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { key } = await req.json();
    if (!key) return NextResponse.json({ error: 'No key provided' }, { status: 400 });

    await deleteAsset(key);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
