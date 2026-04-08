import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { readItems, createItem } from '@directus/sdk';
import { withAdminAuth } from '@/lib/auth/api-auth';

const tagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  color: z.string().optional().nullable(),
  sort_order: z.number().optional()
});

export const GET = withAdminAuth(async () => {
  try {
    const client = await createDirectusServerClient();
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
});

export const POST = withAdminAuth(async (_user, req: NextRequest) => {
  try {
    const body = await req.json();
    const data = tagSchema.parse(body);

    const client = await createDirectusServerClient();
    const created = await client.request(createItem('tags', data));

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create tag' }, { status: 400 });
  }
});
