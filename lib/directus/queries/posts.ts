import { createDirectus, rest, staticToken } from '@directus/sdk';
import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { unstable_cache } from 'next/cache';
import type { Post } from '../types';
import { calculateReadingTime } from '@/lib/utils/readingTime';

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'post';
}


function normalizePost<T extends Partial<Post>>(post: T) {
  if (!post) return post;
  const normalized: any = { ...post };

  if (!normalized.slug && normalized.title) {
    normalized.slug = slugify(normalized.title);
  }

  if (!normalized.reading_time && normalized.content) {
    normalized.reading_time = calculateReadingTime(normalized.content);
  }

  if (normalized.tags && Array.isArray(normalized.tags)) {
    normalized.tags = normalized.tags.map((t: any) => {
      if (t?.tags_id?.id) return String(t.tags_id.id);
      if (t?.id) return String(t.id);
      if (typeof t === 'string' || typeof t === 'number') return String(t);
      return t;
    }).filter(Boolean);
  }

  if (normalized.cover_image && typeof normalized.cover_image === 'string') {
    if (!normalized.cover_image.startsWith('http') && !normalized.cover_image.startsWith('/')) {
      normalized.cover_image = `/api/assets/${normalized.cover_image}`;
    }
  }

  return normalized as T;
}

async function getPostsInternal(params: {
  limit?: number;
  offset?: number;
  status?: string;
  featured?: boolean;
  category?: number;
  search?: string;
  sort?: string[];
}) {
  const { limit = 10, offset = 0, status, featured, category, search, sort = ['-published_at'] } = params;

  const filter: any = {};

  if (status) {
    filter.status = { _eq: status };
  }

  if (featured !== undefined) {
    filter.featured = { _eq: featured };
  }

  if (category) {
    filter.category = { _eq: category };
  }

  if (search) {
    filter._or = [
      { title: { _contains: search } },
      { excerpt: { _contains: search } },
      { content: { _contains: search } }
    ];
  }

  const fields: any[] = [
    'id',
    'title',
    'slug',
    'excerpt',
    'content',
    'cover_image',
    'status',
    'featured',
    'published_at',
    'reading_time',
    'view_count',
    { author: ['id', 'first_name', 'last_name', 'avatar', 'author_slug'] },
    { category: ['id', 'name', 'slug'] },
    { tags: [{ tags_id: ['id', 'name', 'slug'] }] }
  ];

  const posts = await getClient().request(
    readItems('posts', {
      filter,
      limit,
      offset,
      sort,
      fields
    })
  );

  return posts.map(normalizePost);
}

export async function getPosts(params: {
  limit?: number;
  offset?: number;
  status?: string;
  featured?: boolean;
  category?: number;
  search?: string;
  sort?: string[];
}) {
  const { search, ...cacheableParams } = params;

  if (search) {
    return getPostsInternal(params);
  }

  const cacheKey = JSON.stringify(cacheableParams);

  return unstable_cache(
    async () => getPostsInternal(params),
    ['posts', cacheKey],
    {
      revalidate: 60,
      tags: ['posts']
    }
  )();
}

export async function getPostBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const posts = await getClient().request(
        readItems('posts', {
          filter: { slug: { _eq: slug } },
          limit: 1,
          fields: [
            '*',
            { author: ['id', 'first_name', 'last_name', 'email', 'avatar', 'bio', 'author_slug', 'job_title'] },
            { category: ['*'] },
            { tags: [{ tags_id: ['*'] }] }
          ]
        })
      );

      return normalizePost(posts[0] || null);
    },
    ['post', slug],
    {
      revalidate: 60,
      tags: ['posts', `post-${slug}`]
    }
  )();
}

export async function getPostById(id: number) {
  const post = await getClient().request(
    readItem('posts', id, {
      fields: [
        '*',
        { author: ['*'] },
        { category: ['*'] },
        { tags: [{ tags_id: ['*'] }] }
      ]
    })
  );

  return normalizePost(post);
}

export async function createPost(data: Partial<Post>) {
  const payload = normalizePost(data);
  return await getClient().request(createItem('posts', payload));
}

export async function updatePost(id: number, data: Partial<Post>) {
  const payload = normalizePost(data);
  return await getClient().request(updateItem('posts', id, payload));
}

export async function deletePost(id: number) {
  return await getClient().request(deleteItem('posts', id));
}

export async function getArgusPosts(userId: string, isAdmin: boolean = false) {
  const filter: any = {
    is_argus_content: { _eq: true }
  };

  if (!isAdmin) {
    filter._or = [
      { 'argus_users.directus_users_id': { _eq: userId } },
      { argus_users: { _null: true } }
    ];
  }

  const posts = await getClient().request(
    readItems('posts', {
      filter,
      sort: ['-published_at'],
      fields: [
        'id',
        'title',
        'slug',
        'excerpt',
        'content',
        'cover_image',
        'status',
        'published_at',
        'reading_time',
        { document_type: ['id', 'name', 'slug'] },
        { author: ['id', 'first_name', 'last_name', 'avatar', 'author_slug'] },
        { argus_users: [{ directus_users_id: ['id', 'first_name', 'last_name'] }] }
      ]
    })
  );

  return posts.map(normalizePost);
}
