import { NextResponse } from 'next/server';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { readUsers } from '@directus/sdk';

export async function GET() {
  try {
    const client = await createDirectusServerClient({ requireAuth: false });

    const users = await client.request(
      readUsers({
        filter: {
          is_author: { _eq: true }
        },
        fields: ['id', 'first_name', 'last_name', 'skills'],
        limit: 1
      })
    );

    if (!users || users.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const user = users[0];
    const skills = user.skills || [];

    return NextResponse.json({ data: skills });
  } catch (error: any) {
    console.error('[Skills API] Error fetching skills:', error);
    return NextResponse.json({
      error: error?.message || 'Failed to load skills',
      details: process.env.NODE_ENV === 'development' ? error?.errors : undefined
    }, { status: 500 });
  }
}
