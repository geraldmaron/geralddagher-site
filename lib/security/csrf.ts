import { NextRequest } from 'next/server';
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf-token';

export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export function validateCSRFToken(request: NextRequest): boolean {
  if (request.method === 'GET') return true;
  
  const tokenFromHeader = request.headers.get(CSRF_HEADER);
  const tokenFromCookie = request.cookies.get(CSRF_COOKIE)?.value;
  
  if (!tokenFromHeader || !tokenFromCookie) return false;
  
  return crypto.timingSafeEqual(
    Buffer.from(tokenFromHeader),
    Buffer.from(tokenFromCookie)
  );
}

export function createCSRFHeaders(token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secureCookie = isProduction ? 'Secure; ' : '';

  return {
    'Set-Cookie': `${CSRF_COOKIE}=${token}; HttpOnly; ${secureCookie}SameSite=Strict; Path=/`,
    [CSRF_HEADER]: token
  };
}
