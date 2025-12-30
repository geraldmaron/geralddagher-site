import { Logger } from '@/lib/utils/logger';

export interface SubstackSubscribeOptions {
  email?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export class SubstackLinkProvider {
  private publicationUrl: string;

  constructor() {
    this.publicationUrl = process.env.SUBSTACK_PUBLICATION_URL!;
    
    if (!this.publicationUrl) {
      throw new Error('SUBSTACK_PUBLICATION_URL environment variable is required');
    }

    if (!this.publicationUrl.includes('substack.com')) {
      throw new Error('SUBSTACK_PUBLICATION_URL must be a valid Substack publication URL');
    }
  }

  buildSubscribeUrl(options: SubstackSubscribeOptions = {}): string {
    try {
      const baseUrl = this.publicationUrl.endsWith('/') 
        ? this.publicationUrl.slice(0, -1) 
        : this.publicationUrl;
      
      const subscribeUrl = `${baseUrl}/subscribe`;
      const url = new URL(subscribeUrl);

      if (options.email) {
        url.searchParams.set('email', options.email.toLowerCase().trim());
      }

      if (options.source) {
        url.searchParams.set('source', options.source);
      }

      if (options.utm_source) {
        url.searchParams.set('utm_source', options.utm_source);
      }

      if (options.utm_medium) {
        url.searchParams.set('utm_medium', options.utm_medium);
      }

      if (options.utm_campaign) {
        url.searchParams.set('utm_campaign', options.utm_campaign);
      }

      const finalUrl = url.toString();
      
      Logger.info('Generated Substack subscribe URL', { 
        hasEmail: !!options.email,
        source: options.source,
        url: finalUrl.replace(/email=[^&]+/, 'email=***')
      }, { location: 'substack.buildSubscribeUrl' });

      return finalUrl;
    } catch (error) {
      Logger.error('Failed to build Substack subscribe URL', { options, error }, { location: 'substack.buildSubscribeUrl' });
      throw new Error('Failed to generate Substack subscription URL');
    }
  }

  buildUnsubscribeUrl(): string {
    try {
      const baseUrl = this.publicationUrl.endsWith('/') 
        ? this.publicationUrl.slice(0, -1) 
        : this.publicationUrl;
      
      return `${baseUrl}/account/unsubscribe`;
    } catch (error) {
      Logger.error('Failed to build Substack unsubscribe URL', { error }, { location: 'substack.buildUnsubscribeUrl' });
      throw new Error('Failed to generate Substack unsubscribe URL');
    }
  }

  getPublicationInfo(): { name: string; url: string; domain: string } {
    try {
      const url = new URL(this.publicationUrl);
      const domain = url.hostname;
      
      const subdomain = domain.split('.')[0];
      const publicationName = subdomain
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        name: publicationName,
        url: this.publicationUrl,
        domain
      };
    } catch (error) {
      Logger.error('Failed to parse publication info', { publicationUrl: this.publicationUrl, error }, { location: 'substack.getPublicationInfo' });
      return {
        name: 'Substack Publication',
        url: this.publicationUrl,
        domain: 'substack.com'
      };
    }
  }

  createMailtoFallback(options: SubstackSubscribeOptions = {}): string {
    const publicationInfo = this.getPublicationInfo();
    const subject = `Subscribe to ${publicationInfo.name}`;
    const body = `Hi,\n\nI'd like to subscribe to your Substack publication: ${publicationInfo.url}\n\n${options.email ? `My email: ${options.email}\n\n` : ''}Thanks!`;

    return `mailto:support@substack.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}

let substackProviderInstance: SubstackLinkProvider | null = null;

export function getSubstackProvider(): SubstackLinkProvider {
  if (!substackProviderInstance) {
    substackProviderInstance = new SubstackLinkProvider();
  }
  return substackProviderInstance;
}
