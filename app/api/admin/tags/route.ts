import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { readItems, createItem } from '@directus/sdk';
import { getCurrentUser } from '@/lib/directus/auth';

const tagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  color: z.string().optional().nullable(),
  sort_order: z.number().optional()
});

async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return user;
}

export async function GET() {
  try {
    const client = await createDirectusServerClient({ requireAuth: false });
    const data = await client.request(
      readItems('tags', {
        limit: 100,
        sort: ['name']
      })
    );
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to load tags', details: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await ensureAdmin();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = tagSchema.parse(body);

    const client = await createDirectusServerClient();
    const created = await client.request(createItem('tags', data));

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create tag' }, { status: 400 });
  }
}
