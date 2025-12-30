import { NextRequest, NextResponse } from 'next/server';
import { getPosts, getCategories, getTags } from '@/lib/directus/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 6;

    const [posts, categories, tags] = await Promise.all([
      getPosts({ limit, status: 'published', featured: true }),
      getCategories(),
      getTags()
    ]);

    return NextResponse.json(
      {
        posts,
        categories,
        tags
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900'
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
