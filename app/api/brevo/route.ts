import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Logger } from '@/lib/utils/logger';
import { generateTMPSubmissionEmailTemplate, generateContactFormEmailTemplate } from '@/lib/email/templates';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const contactFormSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phoneticSpelling: z.string().optional(),
  pronouns: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email(),
  website: z.string().url().optional(),
  aboutYou: z.string(),
  socialLinks: z.record(z.string(), z.string().url()),
  contactPreferences: z.object({
    methods: z.array(z.string()),
    days: z.array(z.string()),
    times: z.array(z.string())
  })
});

const tmpSubmissionSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  about_you: z.string(),
  phonetic_spelling: z.string().optional(),
  pronouns: z.string().optional(),
  website: z.string().url().optional(),
  youtube_link: z.string().url().optional(),
  session_date: z.string().nullable().optional(),
  social_links: z.record(z.string(), z.string().url()).optional(),
  contact_preferences: z.object({
    selected_contact_methods: z.array(z.string()),
    selected_days: z.array(z.string()),
    selected_times: z.array(z.string()),
    selected_dates: z.array(z.string())
  }),
  status: z.enum(['Pending', 'Scheduled', 'Completed', 'Rejected'])
});

type SubmissionType = 'contact' | 'tmp';

function generateEmailHtml(data: any, type: SubmissionType): { subject: string; html: string; text: string } {
  if (type === 'contact') {
    return generateContactFormEmailTemplate({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        title: data.title,
        company: data.company,
        aboutYou: data.aboutYou,
        phoneticSpelling: data.phoneticSpelling,
        pronouns: data.pronouns,
        website: data.website,
        socialLinks: data.socialLinks,
        contactPreferences: {
          methods: data.contactPreferences.methods,
          days: data.contactPreferences.days,
          times: data.contactPreferences.times
        }
      },
      senderName: 'Gerald Dagher'
    });
  } else {
    return generateTMPSubmissionEmailTemplate({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        title: data.title,
        company: data.company,
        about_you: data.about_you,
        phonetic_spelling: data.phonetic_spelling,
        pronouns: data.pronouns,
        website: data.website,
        youtube_link: data.youtube_link,
        session_date: data.session_date,
        social_links: data.social_links,
        contact_preferences: {
          selected_contact_methods: data.contact_preferences.selected_contact_methods,
          selected_days: data.contact_preferences.selected_days,
          selected_times: data.contact_preferences.selected_times,
          selected_dates: data.contact_preferences.selected_dates
        },
        status: data.status
      },
      senderName: 'Gerald Dagher'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!BREVO_API_KEY) {
      Logger.error('Brevo: Missing API key', { location: 'api.brevo.POST' });
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();
    let jsonData;
    try {
      jsonData = JSON.parse(body);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { type, data } = jsonData;
    if (!type || !['contact', 'tmp'].includes(type)) {
      Logger.error('Brevo: Invalid submission type', { type, location: 'api.brevo.POST' });
      return NextResponse.json(
        { message: 'Invalid submission type' },
        { status: 400 }
      );
    }

    const schema = type === 'contact' ? contactFormSchema : tmpSubmissionSchema;
    const validationResult = schema.safeParse(data);
    if (!validationResult.success) {
      Logger.error('Brevo: Invalid submission data', { errors: validationResult.error.issues }, { location: 'api.brevo.POST' });
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { subject, html, text } = generateEmailHtml(data, type as SubmissionType);

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
      cc: [
        {
          email: 'geraldmdagher@outlook.com',
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
      Logger.error('Brevo: Failed to send email', { 
        status: response.status, 
        error: errorText,
        location: 'api.brevo.POST'
      });
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    Logger.info('Brevo: Email sent successfully', {
      type,
      recipient: 'me@geralddagher.com',
      location: 'api.brevo.POST'
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    Logger.error('Brevo: Unexpected error', { 
      error, 
      location: 'api.brevo.POST'
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
