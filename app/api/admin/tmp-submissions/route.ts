import { NextRequest, NextResponse } from 'next/server';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { createItem, readItems } from '@directus/sdk';
import { getCurrentUser } from '@/lib/directus/auth';
import { z } from 'zod';

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

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await createDirectusServerClient();
    const data = await client.request(
      readItems('tmp_submissions', {
        sort: ['-id'],
        limit: 100
      })
    );

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = submissionSchema.parse(body);

    const client = await createDirectusServerClient();
    const created = await client.request(createItem('tmp_submissions', data));

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create submission' }, { status: 400 });
  }
}
