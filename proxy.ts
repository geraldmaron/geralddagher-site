import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const hasSession = request.cookies.get('directus_session_token');

    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect Argus routes
  if (pathname.startsWith('/argus')) {
    const hasSession = request.cookies.get('directus_session_token');

    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/auth/')) {
      const response = NextResponse.next();
      const origin = request.headers.get('origin');
      const allowedOrigins = [
        'https://geralddagher.com',
        'https://www.geralddagher.com',
        'http://localhost:3000'
      ];
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
      return response;
    }
    return NextResponse.next();
  }

  // Handle domain redirects
  if (hostname === 'geralddagher.com') {
    const url = request.nextUrl.clone();
    url.hostname = 'www.geralddagher.com';
    return NextResponse.redirect(url, 301);
  }

  let theme = 'light';
  const themeCookie = request.cookies.get('theme');
  if (themeCookie?.value === 'dark' || themeCookie?.value === 'light') {
    theme = themeCookie.value;
  } else {
    const prefersDark = request.headers.get('sec-ch-prefers-color-scheme');
    if (prefersDark === 'dark') theme = 'dark';
  }

  const response = NextResponse.next();
  response.headers.set('x-theme', theme);

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://cms.geralddagher.com https://api.unsplash.com https://www.google-analytics.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

  return response;
}
export const config = {
  matcher: [
    '/((?!_next|favicon.ico|fonts|images|icons|public|static).*)',
  ],
};
