import { NextRequest, NextResponse } from 'next/server';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { readUsers, updateUser } from '@directus/sdk';
import { getCurrentUser } from '@/lib/directus/auth';
import { generateRandomPassword, sendPasswordEmail } from '@/lib/auth/password-utils';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await createDirectusServerClient({ requireAuth: false });

    const suspendedArgusUsers = await client.request(
      readUsers({
        filter: {
          has_argus_access: { _eq: true },
          status: { _eq: 'suspended' }
        },
        fields: ['id', 'first_name', 'last_name', 'email', 'status']
      })
    );

    if (!suspendedArgusUsers || suspendedArgusUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No suspended Argus users found to activate.',
        activated: []
      });
    }

    const results = [];
    const errors = [];

    for (const argusUser of suspendedArgusUsers) {
      try {
        const newPassword = generateRandomPassword(16);

        await client.request(
          updateUser(argusUser.id, {
            password: newPassword,
            status: 'active'
          })
        );

        const emailSent = await sendPasswordEmail(
          argusUser.email,
          argusUser.first_name,
          argusUser.last_name,
          newPassword,
          true
        );

        results.push({
          id: argusUser.id,
          email: argusUser.email,
          name: `${argusUser.first_name} ${argusUser.last_name}`,
          emailSent
        });
      } catch (error: any) {
        console.error(`Failed to activate user ${argusUser.email}:`, error);
        errors.push({
          email: argusUser.email,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully activated ${results.length} Argus user(s).`,
      activated: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Argus initiation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initiate Argus users' },
      { status: 500 }
    );
  }
}
