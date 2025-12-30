import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/directus/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const isPublicContent = (post as any)?.status === 'published';
    const headers = isPublicContent
      ? { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' }
      : { 'Cache-Control': 'no-store' };

    return NextResponse.json(post, { headers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}