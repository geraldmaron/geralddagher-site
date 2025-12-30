import { NextResponse } from 'next/server';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { readUsers, createUser } from '@directus/sdk';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/directus/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const isAuthorFilter = searchParams.get('filter[is_author][_eq]');

    const filter = isAuthorFilter === 'true' ? { is_author: { _eq: true } } : {};

    const client = await createDirectusServerClient();
    const data = await client.request(
      readUsers({
        filter,
        fields: ['id', 'first_name', 'last_name', 'email', 'status', 'role', 'is_author', 'author_slug', 'avatar', 'bio', 'job_title', 'company', 'social_links']
      })
    );

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

const createSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  status: z.string().optional(),
  role: z.string().optional(),
  is_author: z.boolean().optional(),
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

    const client = await createDirectusServerClient();
    const created = await client.request(
      createUser({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        password: payload.password,
        status: payload.status || 'active',
        role: payload.role,
        avatar: payload.avatar
      })
    );

    return NextResponse.json({ data: created });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create user' }, { status: 400 });
  }
}
