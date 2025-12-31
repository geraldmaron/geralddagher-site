import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { readItems, createItem } from '@directus/sdk';
import { getCurrentUser } from '@/lib/directus/auth';

const documentTypeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  sort: z.number().optional()
});

export async function GET() {
  try {
    const client = await createDirectusServerClient({ requireAuth: false });
    const data = await client.request(readItems('document_types', { limit: 100, sort: ['sort', 'name'] }));
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to load document types' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const data = documentTypeSchema.parse(body);
    const client = await createDirectusServerClient();
    const created = await client.request(createItem('document_types', data));
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create document type' }, { status: 400 });
  }
}
