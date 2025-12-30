import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/lib/directus/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const search = searchParams.get('search') || undefined;
    const categoryParam = searchParams.get('categoryId') || searchParams.get('category');
    const category = categoryParam ? parseInt(categoryParam) : undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const status = searchParams.get('status') || 'published';

    const posts = await getPosts({
      limit,
      offset,
      status,
      category,
      featured,
      search
    });

    const isPublicContent = status === 'published';
    const headers = isPublicContent
      ? { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' }
      : { 'Cache-Control': 'no-store' };

    return NextResponse.json({ data: posts, total: posts.length }, { headers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}