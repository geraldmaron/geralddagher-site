import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { updateUser, deleteUser, readUser } from '@directus/sdk';
import { getCurrentUser } from '@/lib/directus/auth';
import { generateRandomPassword, sendPasswordEmail } from '@/lib/auth/password-utils';

const updateSchema = z.object({
  role: z.string().optional(),
  is_author: z.boolean().optional(),
  has_argus_access: z.boolean().optional(),
  author_slug: z.string().optional(),
  status: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().nullable().optional(),
  password: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);
    const client = await createDirectusServerClient();

    if (data.status === 'active') {
      const existingUser = await client.request(
        readUser(id, {
          fields: ['id', 'status', 'has_argus_access', 'first_name', 'last_name', 'email']
        })
      );

      const isActivatingSuspendedArgusUser =
        existingUser.status === 'suspended' &&
        existingUser.has_argus_access === true;

      if (isActivatingSuspendedArgusUser) {
        const newPassword = generateRandomPassword(16);
        data.password = newPassword;

        const updated = await client.request(updateUser(id, data));

        await sendPasswordEmail(
          existingUser.email,
          existingUser.first_name,
          existingUser.last_name,
          newPassword,
          true
        );

        return NextResponse.json({
          data: updated,
          message: 'User activated and credentials sent via email.'
        });
      }
    }

    const updated = await client.request(updateUser(id, data));
    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update user' }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const client = await createDirectusServerClient();
    await client.request(deleteUser(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete user' }, { status: 400 });
  }
}
