import { NextResponse } from 'next/server';
import { Logger } from '@/lib/utils/logger';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const FETCH_TIMEOUT = 10000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const pageParam = searchParams.get('page');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }
  
  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ error: 'Unsplash API key is not configured' }, { status: 500 });
  }

  let pageNum = 1;
  if (pageParam !== null && pageParam !== undefined) {
    const trimmed = pageParam.trim();
    if (trimmed === '') {
      pageNum = 1;
    } else {
      const parsed = parseInt(trimmed, 10);
      if (isNaN(parsed) || parsed < 1) {
        return NextResponse.json({ error: `Invalid page parameter: ${pageParam}. Must be a positive integer.` }, { status: 400 });
      }
      if (!/^\d+$/.test(trimmed)) {
        return NextResponse.json({ error: `Invalid page parameter: ${pageParam}. Must be a valid integer.` }, { status: 400 });
      }
      pageNum = parsed;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodedQuery}&per_page=20&page=${pageNum}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      Logger.error('Unsplash API error', { 
        status: response.status, 
        statusText: response.statusText,
        errorText 
      }, { location: 'api.unsplash.search.GET' });
      return NextResponse.json(
        { error: `Unsplash API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      results: data.results || [],
      total: data.total || 0,
      total_pages: data.total_pages || 0,
      current_page: pageNum,
      query: query.trim(),
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      Logger.error('Unsplash API timeout', { query }, { location: 'api.unsplash.search.GET' });
      return NextResponse.json(
        { error: 'Request timeout: Unsplash API took too long to respond' },
        { status: 504 }
      );
    }

    Logger.error('Error fetching from Unsplash', { 
      error: error.message || error,
      query 
    }, { location: 'api.unsplash.search.GET' });
    
    return NextResponse.json(
      { error: `Failed to fetch images from Unsplash: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}