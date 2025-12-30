import type {
  VercelProject,
  VercelDeployment,
  VercelDeploymentListResponse,
  VercelProjectInfo,
  VercelDashboardData,
} from './types';

class VercelClient {
  private apiToken: string;
  private projectId?: string;
  private teamId?: string;
  private baseUrl = 'https://api.vercel.com';
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    this.apiToken = process.env.VERCEL_API_TOKEN || '';
    this.projectId = process.env.VERCEL_PROJECT_ID;
    this.teamId = process.env.VERCEL_TEAM_ID;

    if (!this.apiToken) {
      console.warn('Vercel API: Missing VERCEL_API_TOKEN');
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

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiToken) {
      throw new Error('Vercel API token not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const searchParams = new URLSearchParams();

    // Add teamId to query params if provided
    if (this.teamId) {
      searchParams.append('teamId', this.teamId);
    }

    const finalUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;

    const response = await fetch(finalUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Vercel API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage = `${errorMessage} - ${errorText}`;
      }

      if (response.status === 403) {
        throw new Error(`Vercel API: Forbidden - ${errorMessage}. Check API token permissions.`);
      }
      
      if (response.status === 404) {
        throw new Error(`Vercel API: Not found - ${errorMessage}`);
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Get project information
   */
  async getProjectInfo(): Promise<VercelProjectInfo> {
    return this.retryOperation(async () => {
      if (this.projectId) {
        const project = await this.request<VercelProject>(`/v9/projects/${this.projectId}`);
        return {
          id: project.id,
          name: project.name,
          team: this.teamId,
        };
      }

      // Otherwise, list projects and get the first one
      const projects = await this.request<{ projects: VercelProject[] }>('/v9/projects?limit=1');
      
      if (!projects.projects || projects.projects.length === 0) {
        throw new Error('No projects found. Provide VERCEL_PROJECT_ID or ensure projects exist.');
      }

      const project = projects.projects[0];
      return {
        id: project.id,
        name: project.name,
        team: project.teamId || this.teamId,
      };
    });
  }

  /**
   * Get recent deployments
   */
  async getRecentDeployments(limit: number = 10, projectId?: string): Promise<VercelDeployment[]> {
    return this.retryOperation(async () => {
      const targetProjectId = projectId || this.projectId;
      const endpoint = targetProjectId
        ? `/v6/deployments?projectId=${targetProjectId}&limit=${limit}`
        : `/v6/deployments?limit=${limit}`;

      const response = await this.request<VercelDeploymentListResponse>(endpoint);
      return response.deployments || [];
    });
  }

  /**
   * Get deployment status and details
   */
  async getDeploymentStatus(deploymentId: string): Promise<VercelDeployment> {
    return this.retryOperation(async () => {
      return this.request<VercelDeployment>(`/v13/deployments/${deploymentId}`);
    });
  }

  /**
   * Get all dashboard data
   */
  async getDashboardData(): Promise<VercelDashboardData> {
    try {
      const [project, deployments] = await Promise.all([
        this.getProjectInfo().catch(() => ({
          id: 'unknown',
          name: 'Unknown Project',
          team: this.teamId,
        })),
        this.getRecentDeployments(10).catch(() => []),
      ]);

      const latestDeployment = deployments[0]
        ? {
            state: deployments[0].state,
            url: deployments[0].url,
            createdAt: deployments[0].createdAt,
            commit: deployments[0].meta?.githubCommitMessage
              ? {
                  message: deployments[0].meta.githubCommitMessage,
                  author: deployments[0].meta.githubCommitAuthorName || 'Unknown',
                }
              : undefined,
          }
        : undefined;

      return {
        project,
        deployments,
        latestDeployment,
      };
    } catch (error) {
      console.error('Vercel API: Failed to fetch dashboard data', error);
      throw error;
    }
  }

  /**
   * Validate Vercel API connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      if (!this.apiToken) {
        return false;
      }
      await this.getProjectInfo();
      return true;
    } catch {
      return false;
    }
  }
}

let vercelClientInstance: VercelClient | null = null;

export function getVercelClient(): VercelClient {
  if (!vercelClientInstance) {
    vercelClientInstance = new VercelClient();
  }
  return vercelClientInstance;
}


