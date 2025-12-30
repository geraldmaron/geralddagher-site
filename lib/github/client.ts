interface GitHubFile {
  name: string;
  path: string;
  sha?: string;
  content: string;
}

interface GitHubApiResponse {
  content?: {
    sha: string;
    download_url: string;
  };
  sha?: string;
  message?: string;
}

class GitHubClient {
  private token: string;
  private owner: string;
  private repo: string;
  private branch: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.token = process.env.GITHUB_TOKEN!;
    this.owner = process.env.GITHUB_OWNER!;
    this.repo = process.env.GITHUB_REPO!;
    this.branch = process.env.GITHUB_BRANCH || 'main';
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
    const status = error.status || error.message;
    return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.message || response.statusText;
      
      if (response.status === 404) {
        throw new Error(`File not found: ${endpoint}`);
      }
      
      if (response.status === 403 && errorMessage.includes('API rate limit exceeded')) {
        throw new Error(`GitHub API rate limit exceeded. Please try again later.`);
      }
      
      throw new Error(`GitHub API error: ${response.status} - ${errorMessage}`);
    }

    return response.json();
  }

  async getFile(path: string): Promise<GitHubFile | null> {
    return this.retryOperation(async () => {
      try {
        const response = await this.request(`/contents/${path}?ref=${this.branch}`);
        if (response.type === 'file') {
          return {
            name: response.name,
            path: response.path,
            sha: response.sha,
            content: Buffer.from(response.content, 'base64').toString('utf-8'),
          };
        }
        return null;
      } catch (error: any) {
        if (error.message.includes('File not found')) {
          return null;
        }
        throw error;
      }
    });
  }

  async createFile(path: string, content: string, message: string): Promise<void> {
    if (!content || content.trim() === '') {
      throw new Error('Cannot create file with empty content');
    }

    const encodedContent = Buffer.from(content).toString('base64');
    await this.retryOperation(async () => {
      await this.request(`/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify({
          message,
          content: encodedContent,
          branch: this.branch,
        }),
      });
    });
  }

  async updateFile(path: string, content: string, sha: string, message: string): Promise<void> {
    if (!content || content.trim() === '') {
      throw new Error('Cannot update file with empty content');
    }

    if (!sha || sha.trim() === '') {
      throw new Error('SHA is required for file updates');
    }

    const encodedContent = Buffer.from(content).toString('base64');
    await this.retryOperation(async () => {
      await this.request(`/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify({
          message,
          content: encodedContent,
          sha,
          branch: this.branch,
        }),
      });
    });
  }

  async deleteFile(path: string, sha: string, message: string): Promise<void> {
    if (!sha || sha.trim() === '') {
      throw new Error('SHA is required for file deletion');
    }

    await this.retryOperation(async () => {
      await this.request(`/contents/${path}`, {
        method: 'DELETE',
        body: JSON.stringify({
          message,
          sha,
          branch: this.branch,
        }),
      });
    });
  }

  async listFiles(path: string = ''): Promise<GitHubFile[]> {
    return this.retryOperation(async () => {
      try {
        const response = await this.request(`/contents/${path}?ref=${this.branch}`);
        if (Array.isArray(response)) {
          return response
            .filter(item => item.type === 'file' && item.name.endsWith('.md'))
            .map(item => ({
              name: item.name,
              path: item.path,
              sha: item.sha,
              content: '',
            }));
        }
        return [];
      } catch (error: any) {
        if (error.message.includes('File not found')) {
          return [];
        }
        throw error;
      }
    });
  }

  async createOrUpdateFile(path: string, content: string, message: string): Promise<void> {
    if (!content || content.trim() === '') {
      throw new Error('Cannot create or update file with empty content');
    }

    return this.retryOperation(async () => {
      const existingFile = await this.getFile(path);
      if (existingFile && existingFile.sha) {
        await this.updateFile(path, content, existingFile.sha, message);
      } else {
        await this.createFile(path, content, message);
      }
    });
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.request('');
      return true;
    } catch {
      return false;
    }
  }
}

let githubClientInstance: GitHubClient | null = null;

export function getGitHubClient(): GitHubClient {
  if (!githubClientInstance) {
    githubClientInstance = new GitHubClient();
  }
  return githubClientInstance;
}