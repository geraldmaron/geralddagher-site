import { NextRequest, NextResponse } from 'next/server';
import { createSubscriptionSchema } from '@/lib/validation/subscription';
import { createSubscription, findSubscriptionByEmail } from '@/lib/directus/queries';
import { getBrevoProvider } from '@/lib/email/brevo';
import { getSubstackProvider } from '@/lib/substack/link';
import { rateLimit, createRateLimitKey, getRateLimitHeaders } from '@/lib/utils/rate-limit';
import { validateCSRFToken, generateCSRFToken, createCSRFHeaders } from '@/lib/security/csrf';
import { Logger } from '@/lib/utils/logger';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = forwarded?.split(',')[0] || realIP || 'unknown';
  return clientIP;
}

function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = getUserAgent(request);
  
  try {
    if (!validateCSRFToken(request)) {
      Logger.warn('CSRF token validation failed', { clientIP }, { location: 'api.subscriptions.POST' });
      return NextResponse.json(
        { success: false, message: 'Invalid request' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const validation = createSubscriptionSchema.safeParse(body);
    
    if (!validation.success) {
      Logger.warn('Invalid subscription request', { 
        errors: validation.error.issues,
        clientIP 
      }, { location: 'api.subscriptions.POST' });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request data',
          errors: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { email, blog, substack } = validation.data;

    const rateLimitKey = createRateLimitKey(clientIP, email);
    const rateLimitResult = await rateLimit(rateLimitKey, { 
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5 // 5 attempts per email per 15 minutes
    });

    if (!rateLimitResult.allowed) {
      Logger.warn('Rate limit exceeded for subscription', { 
        email, 
        clientIP,
        resetTime: rateLimitResult.resetTime
      }, { location: 'api.subscriptions.POST' });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many requests. Please try again later.' 
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    let substackRedirectUrl: string | undefined;
    const responses: string[] = [];

    if (blog) {
      try {
        const existing = await findSubscriptionByEmail(email, 'blog');

        if (existing && existing.status === 'active') {
          responses.push('You are already subscribed to blog updates');
        } else {
          const { firstName, lastName } = validation.data;
          await createSubscription(email, {
            firstName,
            lastName,
            type: 'blog'
          });
          const brevoProvider = getBrevoProvider();
          await brevoProvider.sendConfirmationEmail({
            email,
            verificationUrl: `${process.env.APP_BASE_URL || 'https://geralddagher.com'}/confirm?email=${encodeURIComponent(email)}`
          });
          responses.push('Please check your email and confirm your subscription');
        }
      } catch (error) {
        Logger.error('Failed to process blog subscription', {
          email,
          error: error instanceof Error ? error.message : error
        }, { location: 'api.subscriptions.POST' });

        return NextResponse.json(
          {
            success: false,
            message: 'Failed to process blog subscription'
          },
          { status: 500 }
        );
      }
    }

    if (substack) {
      try {
        const existing = await findSubscriptionByEmail(email, 'substack');

        if (!existing || existing.status !== 'active') {
          const { firstName, lastName } = validation.data;
          await createSubscription(email, {
            firstName,
            lastName,
            type: 'substack'
          });
        }

        const substackProvider = getSubstackProvider();
        substackRedirectUrl = substackProvider.buildSubscribeUrl({
          email,
          source: 'website',
          utm_source: 'geralddagher_site',
          utm_medium: 'subscription_form',
          utm_campaign: 'unified_subscription'
        });
        responses.push('Please finish Substack subscription on Substack');
      } catch (error) {
        Logger.error('Failed to process substack subscription', {
          email,
          error: error instanceof Error ? error.message : error
        }, { location: 'api.subscriptions.POST' });
      }
    }

    Logger.info('Subscription request processed', { 
      email, 
      blog, 
      substack, 
      hasSubstackUrl: !!substackRedirectUrl,
      clientIP 
    }, { location: 'api.subscriptions.POST' });

    return NextResponse.json(
      {
        success: true,
        message: responses.join('. '),
        substackRedirectUrl
      },
      { 
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult)
      }
    );

  } catch (error) {
    Logger.error('Subscription API error', { 
      error: error instanceof Error ? error.message : error,
      clientIP 
    }, { location: 'api.subscriptions.POST' });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const csrfToken = generateCSRFToken();
  return NextResponse.json(
    { csrfToken },
    { 
      status: 200,
      headers: createCSRFHeaders(csrfToken)
    }
  );
}
