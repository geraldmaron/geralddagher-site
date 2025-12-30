import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Logger } from '@/lib/utils/logger';
import { generateBugReportEmailTemplate } from '@/lib/email/templates';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const bugReportSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  pageUrl: z.string().url(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  browserInfo: z.string(),
  timestamp: z.string()
});

export async function POST(request: NextRequest) {
  try {
    if (!BREVO_API_KEY) {
      Logger.error('Bug Report: Missing Brevo API key', { location: 'api.bug-report.POST' });
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validationResult = bugReportSchema.safeParse(body);

    if (!validationResult.success) {
      Logger.error('Bug Report: Invalid data', { errors: validationResult.error.issues }, { location: 'api.bug-report.POST' });
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { name, email, pageUrl, description, browserInfo, timestamp } = validationResult.data;

    const { subject, html, text } = generateBugReportEmailTemplate({
      name,
      email,
      pageUrl,
      description,
      browserInfo,
      timestamp
    });

    const emailData = {
      sender: {
        name: 'Gerald Dagher Website',
        email: 'me@geralddagher.com'
      },
      to: [
        {
          email: 'me@geralddagher.com',
          name: 'Gerald Dagher'
        }
      ],
      subject,
      htmlContent: html,
      textContent: text
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
      Logger.error('Bug Report: Failed to send email', {
        status: response.status,
        error: errorText,
        location: 'api.bug-report.POST'
      });
      return NextResponse.json(
        { error: 'Failed to send bug report' },
        { status: 500 }
      );
    }

    Logger.info('Bug Report: Email sent successfully', {
      pageUrl,
      hasEmail: !!email,
      location: 'api.bug-report.POST'
    });

    return NextResponse.json({ message: 'Bug report sent successfully' });
  } catch (error) {
    Logger.error('Bug Report: Unexpected error', {
      error,
      location: 'api.bug-report.POST'
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
