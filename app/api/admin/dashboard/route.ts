import { NextResponse } from 'next/server';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { getCurrentUser } from '@/lib/directus/auth';
import { aggregate } from '@directus/sdk';
import { getCloudflareAnalyticsClient } from '@/lib/cloudflare/client';
import { getVercelClient } from '@/lib/vercel/client';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await createDirectusServerClient();

    const [postsCount, usersCount, categoriesCount, tagsCount, directusHealth] = await Promise.all([
      client.request(aggregate('posts', { aggregate: { count: '*' } })).then(r => r[0]?.count || 0).catch(() => 0),
      client.request(aggregate('directus_users', { aggregate: { count: '*' } })).then(r => r[0]?.count || 0).catch(() => 0),
      client.request(aggregate('categories', { aggregate: { count: '*' } })).then(r => r[0]?.count || 0).catch(() => 0),
      client.request(aggregate('tags', { aggregate: { count: '*' } })).then(r => r[0]?.count || 0).catch(() => 0),
      fetch(`${process.env.DIRECTUS_URL}/server/ping`).then(r => r.text()).then(t => t === 'pong' ? 'ok' : 'error').catch(() => 'error')
    ]);

    let cloudflareData = null;
    try {
      const cloudflareAnalyticsClient = getCloudflareAnalyticsClient();
      cloudflareData = await cloudflareAnalyticsClient.getAllAnalyticsData(30);
    } catch (error: any) {
      console.error('Failed to fetch Cloudflare analytics:', error);
    }

    let vercelData = null;
    try {
      const vercelClient = getVercelClient();
      vercelData = await vercelClient.getDashboardData();
    } catch (error: any) {
      console.error('Failed to fetch Vercel deployment data:', error);
    }

    return NextResponse.json({
      stats: {
        posts: postsCount,
        users: usersCount,
        categories: categoriesCount,
        tags: tagsCount,
      },
      directus: {
        status: directusHealth === 'ok' ? 'healthy' : 'error',
        url: process.env.DIRECTUS_URL
      },
      cloudflare: cloudflareData,
      vercel: vercelData,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to load dashboard data',
      stats: { posts: 0, users: 0, categories: 0, tags: 0 },
      directus: { status: 'error', url: process.env.DIRECTUS_URL },
      cloudflare: null,
      vercel: null,
    }, { status: 500 });
  }
}
