import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPost } from '@/lib/directus/queries/posts';
import { getCurrentUser } from '@/lib/directus/auth';

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.any(),
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
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  seo_keywords: z.string().optional().nullable(),
  is_argus_content: z.boolean().optional(),
  argus_users: z.array(z.string()).optional(),
  document_type: z.number().optional().nullable()
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const roleName = (user as any)?.role?.name?.toLowerCase();
    if (!user || (roleName !== 'admin' && roleName !== 'administrator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const data = postSchema.parse(json);

    const contentString = typeof data.content === 'string'
      ? data.content
      : JSON.stringify(data.content);

    const post = await createPost({
      title: data.title,
      slug: data.slug,
      content: contentString,
      excerpt: data.excerpt,
      cover_image: data.cover_image,
      author: data.author ?? null,
      status: data.status || 'draft',
      featured: data.featured ?? false,
      category: data.category ?? null,
      tags: data.tags?.map((tagId) => ({ tags_id: tagId })) ?? [],
      published_at: data.published_at,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
      seo_keywords: data.seo_keywords,
      is_argus_content: data.is_argus_content ?? false,
      argus_users: data.argus_users?.map((userId) => ({ directus_users_id: userId })) ?? [],
      document_type: data.document_type ?? null
    } as any);

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create post' }, { status: 400 });
  }
}
