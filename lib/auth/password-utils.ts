const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export function generateRandomPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';

  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function sendPasswordEmail(
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  isNewUser: boolean = false
): Promise<boolean> {
  if (!BREVO_API_KEY) {
    throw new Error('Email service not configured');
  }

  const subject = isNewUser ? 'Argus Account Access' : 'Your Password Has Been Reset';
  const greeting = 'Hi';
  const message = isNewUser
    ? 'Your Argus account has been activated. You now have access to your personalized content.'
    : 'Your password has been reset by an administrator. Here are your new login credentials:';

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
    subject,
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
              <h1 style="color: white; margin: 0; font-size: 24px;">${isNewUser ? 'Argus Account Access' : 'Password Reset'}</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="margin-top: 0;">${greeting} ${firstName},</p>
              <p>${message}</p>

              <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Email:</p>
                <p style="font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; color: #1f2937; margin: 0 0 20px 0; word-break: break-all;">${email}</p>

                <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Password:</p>
                <p style="font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #667eea; margin: 0; word-break: break-all;">${password}</p>
              </div>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #92400e; font-weight: 600; margin: 0 0 10px 0;">⚠️ Important Security Notice:</p>
                <ul style="color: #78350f; padding-left: 20px; margin: 0;">
                  <li>Please change this password after your first login from your account settings</li>
                  <li>Do not share this password with anyone</li>
                  <li>This email contains sensitive information - please delete it after saving your password securely</li>
                </ul>
              </div>

              <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #1e40af; font-weight: 600; margin: 0 0 10px 0;">How to Access Argus:</p>
                <ol style="color: #1e3a8a; padding-left: 20px; margin: 5px 0;">
                  <li style="margin-bottom: 8px;"><strong>Go to the login page:</strong> Visit <a href="https://geralddagher.com/login" style="color: #3b82f6; text-decoration: none;">geralddagher.com/login</a></li>
                  <li style="margin-bottom: 8px;"><strong>Sign in:</strong> Enter your email and the password shown above</li>
                  <li style="margin-bottom: 8px;"><strong>Access Argus:</strong> After logging in, you will be taken to your Argus dashboard, or you can visit <a href="https://geralddagher.com/argus" style="color: #3b82f6; text-decoration: none;">geralddagher.com/argus</a> directly</li>
                  <li style="margin-bottom: 8px;"><strong>Change your password:</strong> Click Settings in the top navigation to update your password</li>
                </ol>
              </div>

              <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #065f46; font-weight: 600; margin: 0 0 10px 0;">About Argus:</p>
                <p style="color: #047857; margin: 0;">Your Argus dashboard contains personalized content created for you.</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://geralddagher.com/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Access Your Argus Account</a>
              </div>

              <p style="margin-bottom: 0; color: #6b7280; font-size: 14px;">If you did not expect this email or have any questions, please contact an administrator immediately.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Gerald Dagher. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
${greeting} ${firstName},

${message}

YOUR LOGIN CREDENTIALS:
Email: ${email}
Password: ${password}

IMPORTANT SECURITY NOTICE:
- Please change this password after your first login from your account settings
- Do not share this password with anyone
- This email contains sensitive information - please delete it after saving your password securely

HOW TO ACCESS ARGUS:
1. Go to the login page: https://geralddagher.com/login
2. Sign in: Enter your email and the password shown above
3. Access Argus: After logging in, you will be taken to your Argus dashboard, or you can visit https://geralddagher.com/argus directly
4. Change your password: Click Settings in the top navigation to update your password

ABOUT ARGUS:
Your Argus dashboard contains personalized content created for you.

Direct link to login: https://geralddagher.com/login

If you did not expect this email or have any questions, please contact an administrator immediately.

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
