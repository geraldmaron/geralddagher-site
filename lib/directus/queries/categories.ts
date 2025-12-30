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

export async function getCategories() {
  return unstable_cache(
    async () => {
      return await getClient().request(
        readItems('categories', {
          sort: ['name'],
          fields: ['id', 'name', 'slug', 'description']
        })
      );
    },
    ['categories'],
    {
      revalidate: 300,
      tags: ['categories']
    }
  )();
}

export async function getCategoryBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const categories = await getClient().request(
        readItems('categories', {
          filter: { slug: { _eq: slug } },
          limit: 1
        })
      );

      return categories[0] || null;
    },
    ['category', slug],
    {
      revalidate: 300,
      tags: ['categories', `category-${slug}`]
    }
  )();
}

export async function getCategoryById(id: number) {
  return await getClient().request(readItem('categories', id));
}
