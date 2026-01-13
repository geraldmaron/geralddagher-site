import { NextRequest, NextResponse } from 'next/server';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { updateUser } from '@directus/sdk';
import { getCurrentUser } from '@/lib/directus/auth';
import { z } from 'zod';
import { authentication, rest } from '@directus/sdk';
import { createDirectus } from '@directus/sdk';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()\-_=+]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;

    const directusUrl = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!directusUrl) {
      throw new Error('Directus URL not configured');
    }

    const testClient = createDirectus(directusUrl)
      .with(rest())
      .with(authentication('cookie'));

    try {
      await testClient.login(currentUser.email, currentPassword);
    } catch (error) {
      return NextResponse.json({
        error: 'Current password is incorrect',
        errors: [{ field: 'currentPassword', message: 'Current password is incorrect' }]
      }, { status: 400 });
    }

    const client = await createDirectusServerClient();
    await client.request(updateUser(currentUser.id, { password: newPassword }));

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    console.error('Password change error:', error);
    return NextResponse.json({
      error: error?.message || 'Failed to change password'
    }, { status: 500 });
  }
}
