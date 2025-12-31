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
          'id',
          'title',
          'slug',
          'excerpt',
          'content',
          'status',
          'published_at',
          'reading_time',
          'view_count',
          'featured',
          'cover_image',
          'is_argus_content',
          'document_type.id',
          'document_type.name',
          'author.id',
          'author.first_name',
          'author.last_name',
          'author.email',
          'author.avatar',
          'category.id',
          'category.name',
          'tags.tags_id.id',
          'tags.tags_id.name',
          'argus_users.directus_users_id'
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
