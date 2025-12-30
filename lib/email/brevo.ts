import { Logger } from '@/lib/utils/logger';
import { generateConfirmationEmailTemplate, generatePostPublishedEmailTemplate } from './templates';

interface BrevoContact {
  email: string;
  attributes?: Record<string, any>;
  listIds?: number[];
}

interface BrevoEmail {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: number;
  params?: Record<string, any>;
}

interface BrevoWebhookEvent {
  event: 'delivered' | 'bounced' | 'unsubscribed' | 'opened' | 'clicked';
  email: string;
  date: string;
  messageId?: string;
  reason?: string;
}

export class BrevoEmailProvider {
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;
  private confirmationTemplateId: string;
  private postPublishedTemplateId: string;
  private baseUrl = 'https://api.brevo.com/v3';

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY!;
    this.senderEmail = process.env.BREVO_SENDER_EMAIL!;
    this.senderName = process.env.BREVO_SENDER_NAME!;
    this.confirmationTemplateId = ''; // Not used - we generate custom templates
    this.postPublishedTemplateId = ''; // Not used - we generate custom templates

    if (!this.apiKey) {
      throw new Error('BREVO_API_KEY environment variable is required');
    }
    if (!this.senderEmail) {
      throw new Error('BREVO_SENDER_EMAIL environment variable is required');
    }
    if (!this.senderName) {
      throw new Error('BREVO_SENDER_NAME environment variable is required');
    }
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      return response.json();
    } catch (error) {
      Logger.error('Brevo API request failed', { endpoint, method, error: error instanceof Error ? error.message : error }, { location: 'brevo.makeRequest' });
      throw error;
    }
  }

  async createOrUpdateContact(email: string, attributes: Record<string, any> = {}): Promise<void> {
    const contactData: BrevoContact = {
      email: email.toLowerCase().trim(),
      attributes: {
        EMAIL: email.toLowerCase().trim(),
        ...attributes
      }
    };

    try {
      await this.makeRequest('/contacts', 'POST', contactData);
      Logger.info('Brevo contact created/updated', { email }, { location: 'brevo.createOrUpdateContact' });
    } catch (error: any) {
      if (error.message.includes('400')) {
        Logger.info('Brevo contact already exists, updating', { email }, { location: 'brevo.createOrUpdateContact' });
        await this.makeRequest(`/contacts/${encodeURIComponent(email)}`, 'PUT', { attributes: contactData.attributes });
      } else {
        throw error;
      }
    }
  }

  async sendConfirmationEmail(params: {
    email: string;
    firstName?: string;
    verificationUrl: string;
  }): Promise<void> {
    const { email, firstName, verificationUrl } = params;

    const template = generateConfirmationEmailTemplate({
      firstName,
      confirmationUrl: verificationUrl,
      senderName: this.senderName
    });

    const emailData: BrevoEmail = {
      sender: {
        name: this.senderName,
        email: this.senderEmail
      },
      to: [{
        email: email.toLowerCase().trim(),
        name: firstName
      }],
      subject: template.subject,
      htmlContent: template.html,
      textContent: template.text
    };

    try {
      const result = await this.makeRequest('/smtp/email', 'POST', emailData);
      Logger.info('Confirmation email sent', { email, messageId: result.messageId }, { location: 'brevo.sendConfirmationEmail' });
    } catch (error) {
      Logger.error('Failed to send confirmation email', { email, error }, { location: 'brevo.sendConfirmationEmail' });
      throw error;
    }
  }

  async sendPostPublishedEmail(params: {
    recipients: Array<{ email: string }>;
    post: {
      title: string;
      excerpt?: string;
      url: string;
      publishDate: string;
      coverImage?: string;
    };
  }): Promise<{ sent: number; failed: string[] }> {
    const { recipients, post } = params;
    let sent = 0;
    const failed: string[] = [];

    for (const recipient of recipients) {
      try {
        const template = generatePostPublishedEmailTemplate({
          postTitle: post.title,
          postExcerpt: post.excerpt,
          postUrl: post.url,
          publishDate: post.publishDate,
          coverImage: post.coverImage,
          senderName: this.senderName
        });

        const emailData: BrevoEmail = {
          sender: {
            name: this.senderName,
            email: this.senderEmail
          },
          to: [{
            email: recipient.email.toLowerCase().trim()
          }],
          subject: template.subject,
          htmlContent: template.html,
          textContent: template.text
        };

        await this.makeRequest('/smtp/email', 'POST', emailData);
        sent++;
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        Logger.error('Failed to send post notification email', { 
          email: recipient.email, 
          postTitle: post.title, 
          error 
        }, { location: 'brevo.sendPostPublishedEmail' });
        failed.push(recipient.email);
      }
    }

    Logger.info('Post notification emails sent', { 
      sent, 
      failed: failed.length, 
      postTitle: post.title 
    }, { location: 'brevo.sendPostPublishedEmail' });

    return { sent, failed };
  }

  async sendBatchEmails(emails: BrevoEmail[]): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      try {
        await this.makeRequest('/smtp/email', 'POST', email);
        sent++;
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        Logger.error('Failed to send batch email', { 
          recipients: email.to.map(t => t.email), 
          error 
        }, { location: 'brevo.sendBatchEmails' });
        failed++;
      }
    }

    return { sent, failed };
  }

  async unsubscribeContact(email: string): Promise<void> {
    try {
      await this.makeRequest(`/contacts/${encodeURIComponent(email)}`, 'PUT', {
        emailBlacklisted: true
      });
      Logger.info('Contact unsubscribed in Brevo', { email }, { location: 'brevo.unsubscribeContact' });
    } catch (error) {
      Logger.error('Failed to unsubscribe contact in Brevo', { email, error }, { location: 'brevo.unsubscribeContact' });
      throw error;
    }
  }

  parseWebhookEvent(payload: any): BrevoWebhookEvent | null {
    try {
      return {
        event: payload.event,
        email: payload.email,
        date: payload.date || new Date().toISOString(),
        messageId: payload['message-id'],
        reason: payload.reason
      };
    } catch (error) {
      Logger.error('Failed to parse Brevo webhook event', { payload, error }, { location: 'brevo.parseWebhookEvent' });
      return null;
    }
  }
}

let brevoProviderInstance: BrevoEmailProvider | null = null;

export function getBrevoProvider(): BrevoEmailProvider {
  if (!brevoProviderInstance) {
    brevoProviderInstance = new BrevoEmailProvider();
  }
  return brevoProviderInstance;
}
