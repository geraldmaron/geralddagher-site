import { createDirectus, rest, authentication } from '@directus/sdk';

function getDirectusUrl(): string {
  const url = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;

  if (!url) {
    throw new Error('DIRECTUS_URL or NEXT_PUBLIC_DIRECTUS_URL environment variable is required');
  }

  return url;
}

export function createDirectusClient() {
  return createDirectus(getDirectusUrl())
    .with(rest())
    .with(authentication('cookie', { credentials: 'include' }));
}
