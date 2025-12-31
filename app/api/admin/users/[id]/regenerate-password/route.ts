import { NextRequest, NextResponse } from 'next/server';
import { createDirectusServerClient } from '@/lib/directus/server-client';
import { updateUser, readUser } from '@directus/sdk';
import { getAdminRole } from '@/lib/auth/server-utils';
import { getCurrentUser } from '@/lib/directus/auth';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

function generateRandomPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function sendPasswordEmail(email: string, firstName: string, lastName: string, password: string): Promise<boolean> {
  if (!BREVO_API_KEY) {
    throw new Error('Email service not configured');
  }

  const emailData = {
    sender: {
      name: 'Gerald Dagher Admin',
      email: 'me@geralddagher.com'
    },
    to: [
      {
        email,
        name: `${firstName} ${lastName}`.trim()
      }
    ],
    subject: 'Your Password Has Been Reset',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="margin-top: 0;">Hi ${firstName},</p>
              <p>Your password has been reset by an administrator. Here are your new login credentials:</p>

              <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Your new password:</p>
                <p style="font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #667eea; margin: 0; word-break: break-all;">${password}</p>
              </div>

              <p style="color: #ef4444; font-weight: 600;">⚠️ Important Security Notice:</p>
              <ul style="color: #6b7280; padding-left: 20px;">
                <li>Please change this password after your first login</li>
                <li>Do not share this password with anyone</li>
                <li>This email will not be sent again, so save your password securely</li>
              </ul>

              <p style="margin-bottom: 0;">If you did not request this password reset, please contact an administrator immediately.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Gerald Dagher. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
Hi ${firstName},

Your password has been reset by an administrator.

Your new password: ${password}

IMPORTANT SECURITY NOTICE:
- Please change this password after your first login
- Do not share this password with anyone
- This email will not be sent again, so save your password securely

If you did not request this password reset, please contact an administrator immediately.

© ${new Date().getFullYear()} Gerald Dagher. All rights reserved.
    `.trim()
  };

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY
    },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${errorText}`);
  }

  return true;
}

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
      newPassword
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
