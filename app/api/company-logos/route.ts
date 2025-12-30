import { NextResponse } from 'next/server';
import { getPublicAssetUrl } from '@/lib/r2/client';

export async function GET() {
  const logoMap: Record<string, string> = {
    'IBM': getPublicAssetUrl('site-assets/company-logos/b5ad68ba-bd6c-4c14-ac18-7772bb303fea.png'),
    'HashiCorp': getPublicAssetUrl('site-assets/company-logos/c420ef5c-00b4-4db3-a965-551f3e3b89a3.png'),
    'AT&T': getPublicAssetUrl('site-assets/company-logos/b708bc5d-b83a-4fc8-af5f-22a5b4ee2ad4.png'),
    'The Craneware Group (formerly Sentry Data Systems)': getPublicAssetUrl('site-assets/company-logos/b1d81986-af43-402e-a7eb-ccb076221965.svg')
  };

  return NextResponse.json({ data: logoMap });
}

export const dynamic = 'force-dynamic';
