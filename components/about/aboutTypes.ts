'use client';

export interface DomainSection {
  id: string;
  title: string;
  color: 'blue' | 'green' | 'purple' | 'amber';
  cluster: string;
  summary: string;
  skills: string[];
}

export interface RoleInfo {
  company: string;
  title: string;
  years: string;
  summary: string;
  abbreviatedSummary: string;
  highlights: string[];
  abbreviatedHighlights: string[];
  careersUrl: string;
  imageUrl: string;
}

export const DOMAIN_SECTIONS: DomainSection[] = [
  {
    id: 'sre',
    title: 'Site Reliability Engineering & Production Operations',
    color: 'blue' as const,
    cluster: 'reliability',
    summary: 'HA/SLOs, incident command, and production readiness',
    skills: [
      'HA architecture & runtime operations',
      'SLO/SLA design and governance',
      'Incident command & escalation',
      'Production readiness and runbooks'
    ]
  },
  {
    id: 'operational-intelligence',
    title: 'Operational Intelligence & AIOps',
    color: 'blue' as const,
    cluster: 'reliability',
    summary: 'Signals, service graphing, AIOps, and change intelligence',
    skills: [
      'AIOps and change-risk assessment',
      'Service and dependency graphing',
      'Incident & change management',
      'Probabilistic success criteria (precision/recall)'
    ]
  },
  {
    id: 'platform-engineering',
    title: 'Platform Engineering & Infrastructure',
    color: 'blue' as const,
    cluster: 'platform',
    summary: 'Multi-cloud platforms, IDP, service mesh, and automation',
    skills: [
      'Multi-cloud platform architecture',
      'Internal developer platforms (IDP)',
      'Service mesh patterns',
      'IaC automation and pipelines'
    ]
  },
  {
    id: 'ai-ml-platform',
    title: 'Technical Platform & AI/ML',
    color: 'green' as const,
    cluster: 'platform',
    summary: 'AI/ML product workflows, governance, and platform capabilities',
    skills: [
      'LLM-powered product development',
      'Agentic workflows and automation',
      'AI governance and responsible AI',
      'MLOps and model drift detection',
      'Human-in-the-loop experience design'
    ]
  },
  {
    id: 'enterprise-risk',
    title: 'Enterprise Risk Management',
    color: 'amber' as const,
    cluster: 'compliance',
    summary: 'Risk, BCP/DR, resilience frameworks, and third-party posture',
    skills: [
      'Technical risk identification and mitigation',
      'BCP/DR strategy and playbooks',
      'Risk governance and controls',
      'Third-party dependency posture'
    ]
  },
  {
    id: 'observability',
    title: 'Observability & Performance Engineering',
    color: 'green' as const,
    cluster: 'reliability',
    summary: 'Telemetry, health transparency, alerting, and performance',
    skills: [
      'Distributed tracing and metrics',
      'Telemetry pipelines and storage',
      'Alerting, SLOs, and anomaly signals',
      'Perf analysis and optimization'
    ]
  },
  {
    id: 'devops',
    title: 'DevOps & Continuous Delivery',
    color: 'green' as const,
    cluster: 'platform',
    summary: 'CI/CD guardrails, orchestration, progressive delivery, DevEx',
    skills: [
      'CI/CD architecture and guardrails',
      'Deployment automation and orchestration',
      'Progressive delivery (blue/green, canary)',
      'Release governance and change risk'
    ]
  },
  {
    id: 'cloud-architecture',
    title: 'Cloud Architecture & Infrastructure Design',
    color: 'blue' as const,
    cluster: 'platform',
    summary: 'Cloud-native patterns, multi-region, HA, elasticity, and FinOps',
    skills: [
      'Cloud-native application patterns',
      'Multi-region / multi-cloud strategy',
      'HA and fault-tolerant design',
      'Elasticity and scaling patterns'
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance & Regulatory Framework Management',
    color: 'amber' as const,
    cluster: 'compliance',
    summary: 'FedRAMP/SOC2/ISO programs, controls, evidence, and governance',
    skills: [
      'FedRAMP / SOC 2 / ISO programs',
      'Control design and audits',
      'Evidence pipelines and readiness',
      'Security/compliance automation'
    ]
  },
  {
    id: 'data-metadata',
    title: 'Data Engineering & Metadata Management',
    color: 'purple' as const,
    cluster: 'leadership',
    summary: 'Metadata models, quality, catalog/CMDB, lineage, lifecycle',
    skills: [
      'Metadata models and schema design',
      'Data quality and governance',
      'Service catalog / CMDB curation',
      'Pipelines and lineage'
    ]
  },
  {
    id: 'product-management',
    title: 'Product Strategy & Portfolio Management',
    color: 'purple' as const,
    cluster: 'leadership',
    summary: 'Discovery, roadmaps, OKRs, and executive alignment for product portfolios',
    skills: [
      'Cross-functional initiative leadership',
      'Customer discovery and qualitative research',
      'Roadmap planning and portfolio tradeoffs',
      'OKR/KPI and product metrics design',
      'Executive communication and alignment'
    ]
  },
  {
    id: 'integration',
    title: 'Systems Integration & API Design',
    color: 'blue' as const,
    cluster: 'platform',
    summary: 'API contracts, integrations, EDA, webhooks, and hardening',
    skills: [
      'API strategy and contract design',
      'System-to-system integrations',
      'Event-driven architectures',
      'Integration testing and hardening'
    ]
  },
  {
    id: 'security',
    title: 'Security Engineering & Identity Management',
    color: 'amber' as const,
    cluster: 'compliance',
    summary: 'Zero-trust, IAM, policy guardrails, auth, and incident response',
    skills: [
      'Zero-trust security patterns',
      'Identity and access (IAM)',
      'Policy automation and guardrails',
      'Auth flows and token management'
    ]
  },
  {
    id: 'documentation',
    title: 'Technical Documentation & Knowledge Management',
    color: 'purple' as const,
    cluster: 'leadership',
    summary: 'Docs systems, runbooks/playbooks, KBs, docs-as-code, training',
    skills: [
      'Technical writing systems',
      'Runbooks and playbooks',
      'Knowledge base architecture',
      'Docs-as-code practices'
    ]
  },
  {
    id: 'chaos',
    title: 'Chaos Engineering & Resilience Testing',
    color: 'blue' as const,
    cluster: 'reliability',
    summary: 'Failure injection, DR validation, verification, and recovery',
    skills: [
      'Failure injection and game days',
      'Resilience and DR validation',
      'Blast radius analysis',
      'Stress and soak testing'
    ]
  },
  {
    id: 'org-change',
    title: 'Organizational Change Management',
    color: 'purple' as const,
    cluster: 'leadership',
    summary: 'Process standardization, enablement, culture, operating models',
    skills: [
      'Process standardization',
      'Team enablement and coaching',
      'Operating model design',
      'Metrics-driven improvement'
    ]
  },
  {
    id: 'finops',
    title: 'FinOps & Cloud Cost Management',
    color: 'green' as const,
    cluster: 'platform',
    summary: 'Cost optimization, efficiency, allocation, budgeting, and ROI',
    skills: [
      'Cloud cost optimization',
      'Chargeback / showback',
      'Tagging and allocation',
      'ROI for platform investments'
    ]
  }
];

export const ACCENT_COLORS = {
  blue: {
    icon: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    hover: 'hover:border-blue-500',
    text: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    icon: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/40',
    hover: 'hover:border-green-500',
    text: 'text-green-600 dark:text-green-400'
  },
  purple: {
    icon: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/40',
    hover: 'hover:border-slate-500',
    text: 'text-slate-600 dark:text-slate-400'
  },
  amber: {
    icon: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    hover: 'hover:border-amber-500',
    text: 'text-amber-600 dark:text-amber-400'
  }
};

export const CLUSTER_META: Record<
  string,
  { title: string; summary: string; color: keyof typeof ACCENT_COLORS }
> = {
  reliability: {
    title: 'Reliability & Operations',
    summary: 'Observability, incident command, and DR readiness',
    color: 'blue'
  },
  platform: {
    title: 'Platform & Delivery',
    summary: 'IDP, automation, CI/CD, integrations, and cloud architecture',
    color: 'green'
  },
  compliance: {
    title: 'Risk, Security & Compliance',
    summary: 'Risk governance, security/IAM, and regulatory readiness',
    color: 'amber'
  },
  leadership: {
    title: 'Product & Leadership',
    summary: 'Product strategy, enablement, documentation, and change leadership',
    color: 'purple'
  }
};

export const DOMAIN_CLUSTERS: Record<string, { label: string; color: keyof typeof ACCENT_COLORS | 'neutral' }> = {
  reliability: { label: 'Reliability & Ops', color: 'blue' },
  platform: { label: 'Platform & Delivery', color: 'green' },
  leadership: { label: 'Product & Leadership', color: 'purple' },
  compliance: { label: 'Risk & Compliance', color: 'amber' },
  all: { label: 'All', color: 'neutral' }
};

export const COMPANY_CAREER_URLS: Record<string, string> = {
  'IBM': 'https://www.ibm.com/careers',
  'HashiCorp': 'https://www.hashicorp.com/careers',
  'The Craneware Group (formerly Sentry Data Systems)': 'https://www.craneware.com/careers',
  'AT&T': 'https://www.att.jobs',
  'Verizon': 'https://www.verizon.com/about/careers',
  'Mount Sinai': 'https://careers.mountsinai.org',
  'McDonald\'s': 'https://careers.mcdonalds.com',
  'Verizon Wireless': 'https://www.verizon.com/about/careers',
  'Mount Sinai Health System': 'https://careers.mountsinai.org'
};

export const ROLE_FOCUS: Record<string, string[]> = {
  IBM: ['Platform reliability & DR', 'AI/ML operational intelligence', 'Risk & compliance'],
  HashiCorp: ['Cloud reliability & DR', 'Platform delivery', 'Customer trust'],
  'The Craneware Group (formerly Sentry Data Systems)': ['Compliance SaaS', 'Product Delivery', 'Data Integrity'],
  'AT&T': ['Field Ops', 'Training & Coaching', 'Service Quality']
};
