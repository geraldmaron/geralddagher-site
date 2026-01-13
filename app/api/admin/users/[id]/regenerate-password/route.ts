import { NextRequest, NextResponse } from 'next/server';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { updateUser, readUser } from '@directus/sdk';
import { getCurrentUser } from '@/lib/directus/auth';
import { generateRandomPassword, sendPasswordEmail } from '@/lib/auth/password-utils';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const client = await createDirectusServerClient();

    // Get target user details
    const targetUser = await client.request(
      readUser(id, {
        fields: ['id', 'email', 'first_name', 'last_name', 'role.name']
      })
    );

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions
    const currentUserRoleName = (currentUser as any).role?.name?.toLowerCase();
    const targetRoleName = (targetUser as any).role?.name?.toLowerCase();

    const isCurrentUserAdmin = currentUserRoleName === 'administrator' || currentUserRoleName === 'admin';
    const isCurrentUserArgusAdmin = currentUserRoleName === 'argus admin';
    const isCurrentUserArgusUser = currentUserRoleName === 'argus user';

    const isTargetArgusUser = targetRoleName === 'argus user';
    const isTargetArgusAdmin = targetRoleName === 'argus admin';
    const isTargetAdmin = targetRoleName === 'administrator' || targetRoleName === 'admin';
    const isSelf = targetUser.id === currentUser.id;

    if (isCurrentUserArgusUser) {
      if (!isSelf) {
        return NextResponse.json({
          error: 'Argus users can only regenerate their own password'
        }, { status: 403 });
      }
    }
    else if (isCurrentUserArgusAdmin) {
      if (!isSelf && !isTargetArgusUser) {
        return NextResponse.json({
          error: 'Argus Admins can only regenerate their own password or Argus user passwords'
        }, { status: 403 });
      }
    }
    else if (isCurrentUserAdmin) {
      if (isTargetAdmin && !isSelf) {
        return NextResponse.json({
          error: 'Cannot regenerate password for other administrators'
        }, { status: 403 });
      }
    }
    else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const newPassword = generateRandomPassword(16);

    await client.request(updateUser(id, { password: newPassword }));

    await sendPasswordEmail(
      targetUser.email,
      targetUser.first_name || '',
      targetUser.last_name || '',
      newPassword,
      false
    );

    return NextResponse.json({
      success: true,
      message: 'Password has been reset and sent to the user via email'
    });
  } catch (error: any) {
    console.error('Password regeneration error:', error);
    return NextResponse.json({
      error: error?.message || 'Failed to regenerate password'
    }, { status: 500 });
  }
}
