import { NextResponse } from 'next/server';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { readItems } from '@directus/sdk';
import { getCurrentUser } from '@/lib/directus/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await createDirectusServerClient();
    const data = await client.request(
      readItems('posts', {
        sort: ['-published_at', '-id'],
        limit: 200,
        fields: [
          '*',
          { author: ['id', 'first_name', 'last_name', 'email', 'avatar'] },
          { category: ['id', 'name'] },
          { tags: [{ tags_id: ['id', 'name'] }] }
        ]
      })
    );
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Failed to load posts in admin list route:', error);
    const errorMessage = error?.errors?.[0]?.message || error?.message || 'Unknown error';
    const errorDetails = error?.errors || error;
    return NextResponse.json({
      error: 'Failed to load posts',
      details: errorMessage,
      fullError: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    }, { status: 500 });
  }
}
