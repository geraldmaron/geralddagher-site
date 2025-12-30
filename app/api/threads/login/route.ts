import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.THREADS_APP_ID;
  
  if (!clientId) {
    return NextResponse.json({ error: 'THREADS_APP_ID not configured' }, { status: 500 });
  }

  const url = new URL("https://threads.net/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", process.env.THREADS_REDIRECT_URI || "http://localhost:3000/api/threads/callback");
  url.searchParams.set("scope", "threads_basic,threads_content_publish");
  url.searchParams.set("response_type", "code");

  return NextResponse.redirect(url.toString());
}
