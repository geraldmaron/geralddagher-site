import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createDirectusClient } from '@/lib/directus/client';
import { refresh } from '@directus/sdk';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('directus_refresh_token')?.value;
    const rememberMe = cookieStore.get('directus_remember_me')?.value === '1';

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      );
    }

    const directus = createDirectusClient();
    const result = await directus.request(
      refresh('json', refreshToken)
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      );
    }

    const maxAge = rememberMe ? 60 * 60 * 24 * 90 : 60 * 60 * 24 * 30;
    const refreshMaxAge = rememberMe ? 60 * 60 * 24 * 180 : 60 * 60 * 24 * 60;

    const access = (result as any)?.access_token;
    const newRefresh = (result as any)?.refresh_token;
    const expires = (result as any)?.expires;

    const response = NextResponse.json({
      success: true,
      expiresAt: expires ? new Date(expires).toISOString() : null
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    if (access) {
      response.cookies.set({
        name: 'directus_session_token',
        value: access,
        ...cookieOptions,
        maxAge,
      });
    }

    if (newRefresh) {
      response.cookies.set({
        name: 'directus_refresh_token',
        value: newRefresh,
        ...cookieOptions,
        maxAge: refreshMaxAge,
      });
    }

    response.cookies.set({
      name: 'directus_token_expires',
      value: expires ? expires.toString() : (Date.now() + maxAge * 1000).toString(),
      ...cookieOptions,
      maxAge,
    });
    response.cookies.set({
      name: 'directus_remember_me',
      value: rememberMe ? '1' : '0',
      ...cookieOptions,
      maxAge: refreshMaxAge,
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 401 }
    );
  }
}
