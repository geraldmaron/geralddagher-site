export interface CloudFlareDateRange {
  start: string; // ISO 8601 date string
  end: string; // ISO 8601 date string
}

export interface CloudFlareVisitorStats {
  total: number;
  unique: number;
  trend: number; // Percentage change (positive or negative)
}

export interface CloudFlarePageviewStats {
  total: number;
  trend: number; // Percentage change
}

export interface CloudFlareTopPage {
  path: string;
  views: number;
}

export interface CloudFlareBandwidthStats {
  total: number; // Bytes
  unit: string; // 'B', 'KB', 'MB', 'GB'
  formatted: string; // Human-readable format
}

export interface CloudFlareCountryStats {
  country: string;
  requests: number;
}

export interface CloudFlareTimeSeriesPoint {
  date: string;
  visitors: number;
  pageviews: number;
  bandwidth: number;
}

export interface CloudFlareAnalyticsData {
  visitors: CloudFlareVisitorStats;
  pageviews: CloudFlarePageviewStats;
  bandwidth: CloudFlareBandwidthStats;
  topPages: CloudFlareTopPage[];
  requestsByCountry: CloudFlareCountryStats[];
  timeSeries?: CloudFlareTimeSeriesPoint[];
}

// GraphQL Response Types
export interface CloudFlareGraphQLResponse<T = any> {
  data?: {
    viewer?: {
      zones?: Array<{
        httpRequestsAdaptiveGroups?: Array<{
          dimensions?: Record<string, any>;
          sum?: Record<string, number>;
        }>;
      }>;
    };
  };
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}



