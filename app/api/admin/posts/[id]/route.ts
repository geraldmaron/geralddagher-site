import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { readItems, updateItem, deleteItem } from '@directus/sdk';
import { withAdminAuth } from '@/lib/auth/api-auth';

const updateSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  content: z.any().optional(),
  excerpt: z.string().optional().nullable(),
  cover_image: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  status: z.string().optional(),
  featured: z.boolean().optional(),
  category: z.number().optional().nullable(),
  tags: z.array(z.number()).optional(),
  published_at: z.string().optional().nullable().refine(
    (val) => {
      if (!val) return true;
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: 'published_at must be a valid ISO date string' }
  ),
  is_argus_content: z.boolean().optional(),
  argus_users: z.array(z.string()).optional(),
  document_type: z.number().optional().nullable()
});

export const GET = withAdminAuth(async (_user, _req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const client = await createDirectusServerClient({ requireAuth: false });

    const { id } = await params;

    const decodedId = decodeURIComponent(id);
    const isNumeric = /^\d+$/.test(decodedId);

    const fields = [
      'id',
      'title',
      'slug',
      'content',
      'excerpt',
      'status',
      'featured',
      'published_at',
      'cover_image',
      'tags.tags_id.id',
      'category.id',
      'author.id',
      'author.first_name',
      'author.last_name',
      'author.email',
      'is_argus_content',
      'argus_users.directus_users_id',
      'document_type.id',
      'document_type.name'
    ];

    const filter = isNumeric
      ? { id: { _eq: Number(decodedId) } }
      : { slug: { _eq: decodedId } };

    const posts = await client.request(
      readItems('posts', {
        filter,
        limit: 1,
        fields
      })
    );

    const data = posts && posts.length > 0 ? posts[0] : null;

    if (!data) {
      return NextResponse.json({ error: `Post not found: ${decodedId}` }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    const errorMessage = error?.errors?.[0]?.message || error?.message || 'Not found';
    return NextResponse.json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 404 });
  }
});

export const PATCH = withAdminAuth(async (_user, req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const { id } = await params;

    const client = await createDirectusServerClient();

    const updateData: any = { ...data };

    if (data.content) {
      updateData.content = typeof data.content === 'string'
        ? data.content
        : JSON.stringify(data.content);
    }

    if (data.tags) {
      updateData.tags = data.tags.map((t) => ({ tags_id: t }));
    }

    if (data.argus_users) {
      updateData.argus_users = data.argus_users.map((userId) => ({ directus_users_id: userId }));
    }

    const updated = await client.request(
      updateItem('posts', Number(id), updateData)
    );

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update post' }, { status: 400 });
  }
});

export const DELETE = withAdminAuth(async (_user, _req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const client = await createDirectusServerClient();
    await client.request(deleteItem('posts', Number(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 400 });
  }
});
