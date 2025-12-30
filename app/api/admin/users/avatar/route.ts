import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/directus/auth';
import { getAvatarUrl } from '@/lib/directus/utils/avatar';

export const runtime = 'nodejs';

const directusUrl = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const incomingFormData = await req.formData();
    const file = incomingFormData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('directus_session_token')?.value;
    const accessToken = cookieStore.get('directus_access_token')?.value;
    const apiToken = process.env.DIRECTUS_API_TOKEN;
    const token = sessionToken || accessToken || apiToken;

    if (!token) {
      return NextResponse.json({ error: 'No authentication token available' }, { status: 401 });
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file, file.name);
    uploadFormData.append('folder', '8d16d699-7509-479b-81e7-cb792919ca9d');

    const response = await fetch(`${directusUrl}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'File upload failed' }, { status: response.status });
    }

    const result = await response.json();
    const id = result.data?.id;
    const url = getAvatarUrl(id, { width: 256, height: 256, fit: 'cover', quality: 90 });

    return NextResponse.json({ id, url });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to upload avatar' }, { status: 500 });
  }
}
