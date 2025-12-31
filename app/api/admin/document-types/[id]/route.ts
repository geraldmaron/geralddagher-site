import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { updateItem, deleteItem } from '@directus/sdk';
import { getCurrentUser } from '@/lib/directus/auth';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  sort: z.number().optional()
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);
    const client = await createDirectusServerClient();
    const updated = await client.request(updateItem('document_types', id, data));
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update document type' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const client = await createDirectusServerClient();
    await client.request(deleteItem('document_types', id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete document type' }, { status: 400 });
  }
}
