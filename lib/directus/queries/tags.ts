import { createDirectus, rest, staticToken } from '@directus/sdk';
import { readItems, readItem } from '@directus/sdk';
import { unstable_cache } from 'next/cache';

function getClient() {
  const directusUrl = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;
  if (!directusUrl) {
    throw new Error('DIRECTUS_URL or NEXT_PUBLIC_DIRECTUS_URL is required');
  }
  const apiToken = process.env.DIRECTUS_API_TOKEN;
  return apiToken
    ? createDirectus(directusUrl).with(rest()).with(staticToken(apiToken))
    : createDirectus(directusUrl).with(rest());
}

export async function getTags() {
  return unstable_cache(
    async () => {
      return await getClient().request(
        readItems('tags', {
          sort: ['name'],
          fields: ['id', 'name', 'slug', 'description']
        })
      );
    },
    ['tags'],
    {
      revalidate: 300,
      tags: ['tags']
    }
  )();
}

export async function getTagBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const tags = await getClient().request(
        readItems('tags', {
          filter: { slug: { _eq: slug } },
          limit: 1
        })
      );

      return tags[0] || null;
    },
    ['tag', slug],
    {
      revalidate: 300,
      tags: ['tags', `tag-${slug}`]
    }
  )();
}

export async function getTagById(id: number) {
  return await getClient().request(readItem('tags', id));
}
