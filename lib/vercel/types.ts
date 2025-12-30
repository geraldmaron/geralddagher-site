export interface VercelProject {
  id: string;
  name: string;
  accountId: string;
  updatedAt: number;
  createdAt: number;
  teamId?: string;
}

export interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
  type: string;
  createdAt: number;
  createdIn: string;
  creator?: {
    uid: string;
    email: string;
    username: string;
    name?: string;
  };
  meta?: {
    githubCommitAuthorName?: string;
    githubCommitMessage?: string;
    githubCommitRef?: string;
    githubCommitSha?: string;
    githubDeployment?: string;
    githubOrg?: string;
    githubRepo?: string;
    githubRepoOwnerType?: string;
  };
  target?: string;
  alias?: string[];
  aliasAssigned?: number;
  aliasError?: {
    code: string;
    message: string;
  };
}

export interface VercelDeploymentListResponse {
  deployments: VercelDeployment[];
  pagination?: {
    count: number;
    next?: number;
    prev?: number;
  };
}

export interface VercelProjectInfo {
  name: string;
  team?: string;
  id: string;
}

export interface VercelDashboardData {
  project: VercelProjectInfo;
  deployments: VercelDeployment[];
  latestDeployment?: {
    state: string;
    url: string;
    createdAt: number;
    commit?: {
      message: string;
      author: string;
    };
  };
}


