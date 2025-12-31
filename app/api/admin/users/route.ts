import { NextResponse } from 'next/server';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { readUsers, createUser, updateUser } from '@directus/sdk';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/directus/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAuthorFilter = searchParams.get('filter[is_author][_eq]');
    const hasArgusAccessFilter = searchParams.get('filter[has_argus_access][_eq]');

    const filter: any = {};

    if (isAuthorFilter === 'true') {
      filter.is_author = { _eq: true };
    }

    if (hasArgusAccessFilter === 'true') {
      filter.has_argus_access = { _eq: true };
    }

    const client = await createDirectusServerClient({ requireAuth: false });

    const queryOptions: any = {
      fields: ['id', 'first_name', 'last_name', 'email', 'status', 'role.id', 'role.name', 'is_author', 'has_argus_access', 'author_slug', 'avatar', 'bio', 'job_title', 'company', 'social_links']
    };

    if (Object.keys(filter).length > 0) {
      queryOptions.filter = filter;
    }

    const data = await client.request(readUsers(queryOptions));

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error loading users:', error);
    return NextResponse.json({ error: 'Failed to load users', details: error.message }, { status: 500 });
  }
}

const createSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  status: z.string().optional(),
  role: z.string().optional(),
  is_author: z.boolean().optional(),
  has_argus_access: z.boolean().optional(),
  author_slug: z.string().optional(),
  avatar: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const payload = createSchema.parse(body);

    const userPayload: any = {
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      status: payload.status || 'active',
      role: payload.role,
      avatar: payload.avatar
    };

    if (payload.password) {
      userPayload.password = payload.password;
    }

    const client = await createDirectusServerClient({ requireAuth: false });
    const created = await client.request(createUser(userPayload));

    if (payload.is_author !== undefined || payload.has_argus_access !== undefined || payload.author_slug) {
      const updatePayload: any = {};
      if (payload.is_author !== undefined) updatePayload.is_author = payload.is_author;
      if (payload.has_argus_access !== undefined) updatePayload.has_argus_access = payload.has_argus_access;
      if (payload.author_slug) updatePayload.author_slug = payload.author_slug;

      if (Object.keys(updatePayload).length > 0) {
        await client.request(updateUser((created as any).id, updatePayload));
      }
    }

    return NextResponse.json({ data: created });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create user' }, { status: 400 });
  }
}
