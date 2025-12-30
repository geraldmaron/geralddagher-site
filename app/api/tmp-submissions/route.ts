import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { createItem, readItems } from '@directus/sdk';

const submissionSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  job_title: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  about_you: z.string().optional().nullable(),
  status: z.enum(['Pending', 'Scheduled', 'Completed', 'Rejected']).default('Pending'),
  phonetic_spelling: z.string().optional().nullable(),
  pronouns: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  youtube_link: z.string().optional().nullable(),
  contact_preferences: z.record(z.any()).optional().nullable(),
  social_links: z.record(z.any()).optional().nullable(),
  session_date: z.string().optional().nullable(),
  scheduled_at: z.string().optional().nullable(),
  completed_at: z.string().optional().nullable(),
  rejected_at: z.string().optional().nullable(),
  rejected_reason: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = submissionSchema.parse(body);

    // Public endpoint - don't use expired user cookies
    const client = await createDirectusServerClient({ requireAuth: false });
    const created = await client.request(createItem('tmp_submissions', data));

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to submit' }, { status: 400 });
  }
}

export async function GET() {
  try {
    const client = await createDirectusServerClient({ requireAuth: false });

    const items = await client.request(
      readItems('tmp_submissions', {
        filter: {
          status: { _eq: 'Completed' },
          youtube_link: { _nnull: true }
        },
        limit: 50,
        sort: ['-completed_at'],
        fields: ['id', 'first_name', 'last_name', 'email', 'status', 'about_you', 'youtube_link', 'social_links', 'contact_preferences', 'session_date', 'scheduled_at', 'completed_at', 'date_created', 'date_updated']
      })
    );

    // Map Directus field names to match our types
    const data = items.map((item: any) => ({
      ...item,
      created_at: item.date_created,
      updated_at: item.date_updated
    }));

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('[TMP API] Error fetching submissions:', error);
    return NextResponse.json({
      error: error?.message || 'Failed to load submissions',
      details: process.env.NODE_ENV === 'development' ? error?.errors : undefined
    }, { status: 500 });
  }
}
