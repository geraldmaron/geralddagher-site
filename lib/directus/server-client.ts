import { cookies } from 'next/headers';
import { createDirectus, rest, staticToken } from '@directus/sdk';

function getDirectusUrl() {
  const directusUrl = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;
  if (!directusUrl) {
    throw new Error('DIRECTUS_URL or NEXT_PUBLIC_DIRECTUS_URL environment variable is required');
  }
  return directusUrl;
}

export async function getDirectusClient(options?: { requireAuth?: boolean }) {
  return createDirectusServerClient(options);
}

export async function createDirectusServerClient(options?: { requireAuth?: boolean }) {
  const directusUrl = getDirectusUrl();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('directus_session_token')?.value;
  const apiToken = process.env.DIRECTUS_API_TOKEN;

  const base = createDirectus(directusUrl).with(rest());

  if (sessionToken) {
    return base.with(staticToken(sessionToken));
  }

  if (options?.requireAuth) {
    return base;
  }

  if (apiToken) {
    return base.with(staticToken(apiToken));
  }

  return base;
}
