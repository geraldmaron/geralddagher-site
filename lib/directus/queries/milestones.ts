import { createDirectus, rest, staticToken } from '@directus/sdk';
import { readItems } from '@directus/sdk';
import { unstable_cache } from 'next/cache';
import type { Milestone } from '../types';

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

export async function getMilestones(): Promise<Array<{
  id: number;
  event: string;
  year: string;
  icon: string;
  color: string;
  summary: string;
}>> {
  return unstable_cache(
    async () => {
      const items = await getClient().request(
        readItems('milestones', {
          sort: ['year'],
          filter: {
            is_public: { _eq: true }
          },
          fields: ['id', 'event', 'year', 'icon', 'color', 'summary']
        })
      ) as Milestone[];

      return items.map(item => ({
        id: item.id,
        event: item.event,
        year: String(item.year),
        icon: item.icon,
        color: item.color,
        summary: item.summary,
      }));
    },
    ['milestones'],
    {
      revalidate: 3600,
      tags: ['milestones']
    }
  )();
}
