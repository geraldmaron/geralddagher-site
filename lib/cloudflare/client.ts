import type {
  CloudFlareDateRange,
  CloudFlareVisitorStats,
  CloudFlarePageviewStats,
  CloudFlareTopPage,
  CloudFlareBandwidthStats,
  CloudFlareCountryStats,
  CloudFlareAnalyticsData,
  CloudFlareGraphQLResponse,
  CloudFlareTimeSeriesPoint,
} from './types';

class CloudFlareAnalyticsClient {
  private apiToken: string;
  private zoneId: string;
  private graphqlEndpoint = 'https://api.cloudflare.com/client/v4/graphql';
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || '';

    if (!this.apiToken || !this.zoneId) {
      console.warn('CloudFlare Analytics API: Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID');
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.retryOperation(operation, retryCount + 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    const status = error.status || error.statusCode;
    return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
  }

  private async graphqlRequest<T = any>(
    query: string,
    variables: Record<string, any> = {}
  ): Promise<T> {
    if (!this.apiToken || !this.zoneId) {
      throw new Error('CloudFlare API token or Zone ID not configured');
    }

    const response = await fetch(this.graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CloudFlare API error: ${response.status} - ${errorText}`);
    }

    const result: CloudFlareGraphQLResponse = await response.json();

    if (result.errors && result.errors.length > 0) {
      throw new Error(`CloudFlare GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
    }

    return result.data as T;
  }

  private formatBytes(bytes: number): { value: number; unit: string; formatted: string } {
    if (bytes === 0) return { value: 0, unit: 'B', formatted: '0 B' };
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    return {
      value: bytes,
      unit: sizes[i],
      formatted: `${value.toFixed(2)} ${sizes[i]}`,
    };
  }

  private getDateRange(days: number = 30): CloudFlareDateRange {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }

  /**
   * Get visitor statistics including total and unique visitors
   */
  async getVisitorStats(days: number = 30): Promise<CloudFlareVisitorStats> {
    return this.retryOperation(async () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);

      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const query = `
        query VisitorStats($zoneTag: String!, $start: String!, $end: String!) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequests1dGroups(
                filter: {
                  date_geq: $start,
                  date_leq: $end
                },
                limit: 10000
              ) {
                sum {
                  pageViews
                }
                uniq {
                  uniques
                }
              }
            }
          }
        }
      `;

      const result = await this.graphqlRequest<{
        viewer?: {
          zones?: Array<{
            httpRequests1dGroups?: Array<{
              sum?: { pageViews?: number };
              uniq?: { uniques?: number };
            }>;
          }>;
        };
      }>(query, {
        zoneTag: this.zoneId,
        start: startDate,
        end: endDate,
      });

      const currentVisits =
        result.viewer?.zones?.[0]?.httpRequests1dGroups?.reduce(
          (sum: number, group: { uniq?: { uniques?: number } }) => sum + (group.uniq?.uniques || 0),
          0
        ) || 0;

      return {
        total: currentVisits,
        unique: currentVisits,
        trend: 0,
      };
    });
  }

  /**
   * Get pageview statistics
   */
  async getPageviews(days: number = 30): Promise<CloudFlarePageviewStats> {
    return this.retryOperation(async () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);

      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const query = `
        query PageviewStats($zoneTag: String!, $start: String!, $end: String!) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequests1dGroups(
                filter: {
                  date_geq: $start,
                  date_leq: $end
                },
                limit: 10000
              ) {
                sum {
                  pageViews
                  requests
                }
              }
            }
          }
        }
      `;

      const result = await this.graphqlRequest<{
        viewer?: {
          zones?: Array<{
            httpRequests1dGroups?: Array<{ sum?: { pageViews?: number; requests?: number } }>;
          }>;
        };
      }>(query, {
        zoneTag: this.zoneId,
        start: startDate,
        end: endDate,
      });

      const currentPageviews =
        result.viewer?.zones?.[0]?.httpRequests1dGroups?.reduce(
          (sum, group) => sum + (group.sum?.pageViews || group.sum?.requests || 0),
          0
        ) || 0;

      return {
        total: currentPageviews,
        trend: 0,
      };
    });
  }

  /**
   * Get top pages by request count
   */
  async getTopPages(limit: number = 10, days: number = 30): Promise<CloudFlareTopPage[]> {
    return this.retryOperation(async () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);

      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const startDateTime = `${startDate}T00:00:00Z`;
      const endDateTime = `${endDate}T23:59:59Z`;

      const query = `
        query TopPages($zoneTag: String!, $start: DateTime!, $end: DateTime!, $limit: Int64!) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequestsAdaptiveGroups(
                filter: {
                  date_geq: $start,
                  date_leq: $end
                },
                limit: $limit,
                orderBy: [sum_requests_DESC]
              ) {
                dimensions {
                  clientRequestHTTPHost
                  clientRequestPath
                }
                sum {
                  requests
                }
              }
            }
          }
        }
      `;

      const result = await this.graphqlRequest<{
        viewer?: {
          zones?: Array<{
            httpRequestsAdaptiveGroups?: Array<{
              dimensions?: {
                clientRequestHTTPHost?: string;
                clientRequestPath?: string;
              };
              sum?: { requests?: number };
            }>;
          }>;
        };
      }>(query, {
        zoneTag: this.zoneId,
        start: startDateTime,
        end: endDateTime,
        limit: limit * 10,
      });

      const groups = result.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];

      // Aggregate by path and filter out static assets
      const pageMap = new Map<string, number>();
      const staticExtensions = ['.js', '.css', '.jpg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];

      groups.forEach((group) => {
        const path = group.dimensions?.clientRequestPath || '/';
        const requests = group.sum?.requests || 0;

        // Skip static assets
        if (staticExtensions.some((ext) => path.endsWith(ext))) {
          return;
        }

        // Skip API routes for analytics
        if (path.startsWith('/api/')) {
          return;
        }

        const current = pageMap.get(path) || 0;
        pageMap.set(path, current + requests);
      });

      // Convert to array, sort, and limit
      const topPages: CloudFlareTopPage[] = Array.from(pageMap.entries())
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);

      return topPages;
    });
  }

  /**
   * Get bandwidth statistics
   */
  async getBandwidthStats(days: number = 30): Promise<CloudFlareBandwidthStats> {
    return this.retryOperation(async () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);

      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const query = `
        query BandwidthStats($zoneTag: String!, $start: String!, $end: String!) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequests1dGroups(
                filter: {
                  date_geq: $start,
                  date_leq: $end
                },
                limit: 10000
              ) {
                sum {
                  edgeResponseBytes
                }
              }
            }
          }
        }
      `;

      const result = await this.graphqlRequest<{
        viewer?: {
          zones?: Array<{
            httpRequests1dGroups?: Array<{ sum?: { edgeResponseBytes?: number } }>;
          }>;
        };
      }>(query, {
        zoneTag: this.zoneId,
        start: startDate,
        end: endDate,
      });

      const totalBytes =
        result.viewer?.zones?.[0]?.httpRequests1dGroups?.reduce(
          (sum, group) => sum + (group.sum?.edgeResponseBytes || 0),
          0
        ) || 0;

      const formatted = this.formatBytes(totalBytes);

      return {
        total: totalBytes,
        unit: formatted.unit,
        formatted: formatted.formatted,
      };
    });
  }

  /**
   * Get requests by country
   */
  async getRequestsByCountry(limit: number = 10, days: number = 30): Promise<CloudFlareCountryStats[]> {
    return this.retryOperation(async () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);

      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const startDateTime = `${startDate}T00:00:00Z`;
      const endDateTime = `${endDate}T23:59:59Z`;

      const query = `
        query RequestsByCountry($zoneTag: String!, $start: DateTime!, $end: DateTime!, $limit: Int64!) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequestsAdaptiveGroups(
                filter: {
                  date_geq: $start,
                  date_leq: $end
                },
                limit: $limit,
                orderBy: [sum_requests_DESC]
              ) {
                dimensions {
                  clientCountryName
                }
                sum {
                  requests
                }
              }
            }
          }
        }
      `;

      const result = await this.graphqlRequest<{
        viewer?: {
          zones?: Array<{
            httpRequestsAdaptiveGroups?: Array<{
              dimensions?: { clientCountryName?: string };
              sum?: { requests?: number };
            }>;
          }>;
        };
      }>(query, {
        zoneTag: this.zoneId,
        start: startDateTime,
        end: endDateTime,
        limit: limit * 5,
      });

      const groups = result.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];

      // Aggregate by country
      const countryMap = new Map<string, number>();
      groups.forEach((group) => {
        const country = group.dimensions?.clientCountryName || 'Unknown';
        const requests = group.sum?.requests || 0;
        const current = countryMap.get(country) || 0;
        countryMap.set(country, current + requests);
      });

      // Convert to array, sort, and limit
      const countries: CloudFlareCountryStats[] = Array.from(countryMap.entries())
        .map(([country, requests]) => ({ country, requests }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, limit);

      return countries;
    });
  }

  async getTimeSeriesData(days: number = 30): Promise<CloudFlareTimeSeriesPoint[]> {
    return this.retryOperation(async () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const query = `
        query TimeSeriesData($zoneTag: String!, $start: String!, $end: String!) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequests1dGroups(
                filter: {
                  date_geq: $start,
                  date_leq: $end
                },
                limit: 10000,
                orderBy: [date_ASC]
              ) {
                dimensions {
                  date
                }
                sum {
                  requests
                }
                uniq {
                  uniques
                }
              }
            }
          }
        }
      `;

      const result = await this.graphqlRequest<{
        viewer?: {
          zones?: Array<{
            httpRequests1dGroups?: Array<{
              dimensions?: { date?: string };
              sum?: { requests?: number };
              uniq?: { uniques?: number };
            }>;
          }>;
        };
      }>(query, {
        zoneTag: this.zoneId,
        start: startDate,
        end: endDate,
      });

      const groups = result.viewer?.zones?.[0]?.httpRequests1dGroups || [];

      const timeSeries: CloudFlareTimeSeriesPoint[] = groups.map((group) => ({
        date: group.dimensions?.date || '',
        visitors: group.uniq?.uniques || 0,
        pageviews: group.sum?.requests || 0,
        bandwidth: 0,
      }));

      return timeSeries;
    });
  }

  /**
   * Get all analytics data in one call
   */
  async getAllAnalyticsData(days: number = 30): Promise<CloudFlareAnalyticsData> {
    try {
      const [visitors, pageviews, bandwidth, topPages, requestsByCountry, timeSeries] = await Promise.all([
        this.getVisitorStats(days).catch(() => ({
          total: 0,
          unique: 0,
          trend: 0,
        })),
        this.getPageviews(days).catch(() => ({
          total: 0,
          trend: 0,
        })),
        this.getBandwidthStats(days).catch(() => ({
          total: 0,
          unit: 'B',
          formatted: '0 B',
        })),
        this.getTopPages(10, days).catch(() => []),
        this.getRequestsByCountry(10, days).catch(() => []),
        this.getTimeSeriesData(days).catch(() => []),
      ]);

      return {
        visitors,
        pageviews,
        bandwidth,
        topPages,
        requestsByCountry,
        timeSeries,
      };
    } catch (error) {
      console.error('CloudFlare Analytics: Failed to fetch all data', error);
      throw error;
    }
  }

  /**
   * Validate CloudFlare API connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      if (!this.apiToken || !this.zoneId) {
        return false;
      }
      await this.getVisitorStats(1);
      return true;
    } catch {
      return false;
    }
  }
}

let cloudflareAnalyticsClientInstance: CloudFlareAnalyticsClient | null = null;

export function getCloudflareAnalyticsClient(): CloudFlareAnalyticsClient {
  if (!cloudflareAnalyticsClientInstance) {
    cloudflareAnalyticsClientInstance = new CloudFlareAnalyticsClient();
  }
  return cloudflareAnalyticsClientInstance;
}



