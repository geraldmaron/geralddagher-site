import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDirectusClient } from '@/lib/directus/client';
import { login } from '@directus/sdk';
import { checkRateLimit, clearRateLimit } from '@/lib/auth/rate-limit';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = signInSchema.parse(body);

    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
    const identifier = `signin:${email}:${clientIP}`;
    const rateLimitCheck = checkRateLimit(identifier);

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimitCheck.retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitCheck.retryAfter?.toString() || '900'
          }
        }
      );
    }

    const directus = createDirectusClient();
    const result = await directus.request(
      login(email, password, {
        mode: 'json',
      })
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    clearRateLimit(identifier);

    const maxAge = rememberMe ? 60 * 60 * 24 * 90 : 60 * 60 * 24 * 30;
    const refreshMaxAge = rememberMe ? 60 * 60 * 24 * 180 : 60 * 60 * 24 * 60;

    const access = (result as any)?.access_token;
    const refresh = (result as any)?.refresh_token;
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
    if (refresh) {
      response.cookies.set({
        name: 'directus_refresh_token',
        value: refresh,
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
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }
}
