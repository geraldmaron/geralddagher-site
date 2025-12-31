import { NextResponse } from 'next/server';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { readRoles } from '@directus/sdk';

export async function GET() {
  try {
    const client = await createDirectusServerClient({ requireAuth: false });
    const data = await client.request(readRoles({ fields: ['id', 'name', 'description'] }));
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to load roles' }, { status: 500 });
  }
}
