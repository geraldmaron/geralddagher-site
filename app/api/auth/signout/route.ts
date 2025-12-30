import { NextRequest, NextResponse } from 'next/server';
import { createDirectusClient } from '@/lib/directus/client';
import { logout } from '@directus/sdk';

export async function POST(_request: NextRequest) {
  try {
    const directus = createDirectusClient();

    try {
      await directus.request(logout());
    } catch (error) {
      // Ignore logout errors
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('directus_session_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('directus_refresh_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('directus_token_expires', '', { maxAge: 0, path: '/' });
    response.cookies.set('directus_remember_me', '', { maxAge: 0, path: '/' });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: 'Sign out failed' },
      { status: 500 }
    );
  }
}
