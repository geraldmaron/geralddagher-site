import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { updateItem, deleteItem } from '@directus/sdk';
import { withAdminAuth } from '@/lib/auth/api-auth';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  sort: z.number().optional()
});

export const PATCH = withAdminAuth(async (_user, req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);
    const client = await createDirectusServerClient();
    const updated = await client.request(updateItem('document_types', id, data));
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update document type' }, { status: 400 });
  }
});

export const DELETE = withAdminAuth(async (_user, _req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const client = await createDirectusServerClient();
    await client.request(deleteItem('document_types', id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete document type' }, { status: 400 });
  }
});
