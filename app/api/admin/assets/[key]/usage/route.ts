import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/directus/auth';
import { getPublicAssetUrl } from '@/lib/r2/client';
import { findAssetUsage } from '@/lib/utils/asset-usage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key } = await params;
    if (!key) {
      return NextResponse.json({ error: 'Asset key is required' }, { status: 400 });
    }

    const assetUrl = getPublicAssetUrl(key);
    const usage = await findAssetUsage(key, assetUrl);

    return NextResponse.json(usage);
  } catch (error: any) {
    console.error('Error fetching asset usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset usage', details: error?.message },
      { status: 500 }
    );
  }
}


