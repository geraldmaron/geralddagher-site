'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  MapPin,
  ExternalLink,
  Briefcase,
  X,
  Heart,
  User,
  Home,
  Users,
  Clock,
  Award,
  DollarSign
} from 'lucide-react';
import { useTheme } from '@/components/core/ThemeProvider';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import * as Sheet from '@radix-ui/react-dialog';
import Button from '@/components/core/Button';

interface DomainSection {
  id: string;
  title: string;
  color: 'blue' | 'green' | 'purple' | 'amber';
  cluster: string;
  summary: string;
  skills: string[];
}

interface RoleInfo {
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

const DOMAIN_SECTIONS: DomainSection[] = [
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
    title: 'Technical Program & Product Management',
    color: 'purple' as const,
    cluster: 'leadership',
    summary: 'Initiative leadership, roadmaps, PRDs, strategy, and OKRs/KPIs',
    skills: [
      'Cross-functional initiative leadership',
      'Technical roadmap and delivery',
      'Product strategy and vision',
      'OKR/KPI definition and tracking'
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

const CLUSTER_META: Record<
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

const DOMAIN_CLUSTERS: Record<string, { label: string; color: keyof typeof ACCENT_COLORS | 'neutral' }> = {
  reliability: { label: 'Reliability & Ops', color: 'blue' },
  platform: { label: 'Platform & Delivery', color: 'green' },
  leadership: { label: 'Product & Leadership', color: 'purple' },
  compliance: { label: 'Risk & Compliance', color: 'amber' },
  all: { label: 'All', color: 'neutral' }
};

const ACCENT_COLORS = {
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
    icon: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/40',
    hover: 'hover:border-purple-500',
    text: 'text-purple-600 dark:text-purple-400'
  },
  amber: {
    icon: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    hover: 'hover:border-amber-500',
    text: 'text-amber-600 dark:text-amber-400'
  }
};

const AboutSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [currentKeyword, setCurrentKeyword] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isProfessionalOpen, setIsProfessionalOpen] = useState(false);
  const [isPersonalOpen, setIsPersonalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('reliability');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [domainSections, setDomainSections] = useState<DomainSection[]>(DOMAIN_SECTIONS);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [companyLogos, setCompanyLogos] = useState<Record<string, string>>({});

  const keywords = personalInfo?.profile?.keywords || [];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setPersonalInfo(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await fetch('/api/company-logos');
        if (!response.ok) {
          throw new Error('Failed to fetch company logos');
        }
        const data = await response.json();
        setCompanyLogos(data.data || {});
      } catch (error) {
        console.error('Error fetching company logos:', error);
      }
    };
    fetchLogos();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch('/api/users/skills');
        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }
        const { data } = await response.json();
        if (data && data.length > 0) {
          setDomainSections(data);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
        // Fallback to hardcoded DOMAIN_SECTIONS (already set in initial state)
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  const aggregatedThemes = useMemo(() => {
    const groups = new Map<
      string,
      {
        id: string;
        title: string;
        summary: string;
        color: keyof typeof ACCENT_COLORS;
        skills: string[];
        domains: string[];
      }
    >();

    domainSections.forEach((section) => {
      const meta = CLUSTER_META[section.cluster];
      if (!meta) return;

      if (!groups.has(section.cluster)) {
        groups.set(section.cluster, {
          id: section.cluster,
          title: meta.title,
          summary: meta.summary,
          color: meta.color,
          skills: [],
          domains: []
        });
      }

      const group = groups.get(section.cluster)!;

      section.skills.forEach((skill) => {
        if (!group.skills.includes(skill)) {
          group.skills.push(skill);
        }
      });

      group.domains.push(section.title);
    });

    return Array.from(groups.values());
  }, [domainSections]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (keywords.length < 2) return;
    const interval = setInterval(() => {
      setCurrentKeyword((prev) => (prev + 1) % keywords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [keywords.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };


  const COMPANY_CAREER_URLS: Record<string, string> = {
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

  const ROLE_FOCUS: Record<string, string[]> = {
    IBM: ['Reliability & DR', 'Platform Strategy', 'Risk & Compliance'],
    HashiCorp: ['Cloud Reliability', 'Platform Delivery', 'Customer Trust'],
    'The Craneware Group (formerly Sentry Data Systems)': ['Compliance SaaS', 'Product Delivery', 'Data Integrity'],
    'AT&T': ['Field Ops', 'Training & Coaching', 'Service Quality']
  };

  const MAX_VISIBLE_MAIN = 3;
  const MAX_VISIBLE_DRAWER = 8;

  const getFilteredDomains = () => {
    if (selectedFilter === 'all') {
      return domainSections;
    }
    return domainSections.filter((section) => section.cluster === selectedFilter);
  };

  const getVisibleSkills = (skills: string[], limit: number) => skills.slice(0, limit);

  return (
    <section
      role="region"
      aria-label="About me"
      data-section="about"
      className={cn(
        "relative w-full py-16 md:py-24 px-4",
        isDarkMode ? "bg-black" : "bg-white"
      )}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="space-y-16"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-neutral-800"
              variants={itemVariants}
            >
              <MapPin className="w-3.5 h-3.5" />
              {personalInfo?.profile?.location}
            </motion.div>

            <div className="space-y-3">
              <motion.h1
                className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white"
                variants={itemVariants}
              >
                About Me
              </motion.h1>

              <motion.div
                className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-400"
                variants={itemVariants}
              >
                <span>I'm {keywords[currentKeyword] && ['A', 'E', 'I', 'O', 'U'].includes(keywords[currentKeyword][0]) ? 'an' : 'a'}</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentKeyword}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="font-semibold text-gray-900 dark:text-white"
                  >
                    {keywords[currentKeyword] === 'Ally' ? (
                      <span className="inline-flex">
                        <span className="animate-pulse text-red-500 dark:text-red-400">A</span>
                        <span className="animate-pulse text-orange-500 dark:text-orange-400" style={{ animationDelay: '0.1s' }}>l</span>
                        <span className="animate-pulse text-green-500 dark:text-green-400" style={{ animationDelay: '0.2s' }}>l</span>
                        <span className="animate-pulse text-blue-500 dark:text-blue-400" style={{ animationDelay: '0.3s' }}>y</span>
                      </span>
                    ) : (
                      keywords[currentKeyword]
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            </div>

            <motion.p
              variants={itemVariants}
              className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-5xl"
            >
              {personalInfo?.profile?.about?.businessCard || ''}
            </motion.p>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Experience Card */}
            <motion.div
              className={cn(
                'p-6 rounded-2xl border transition-all duration-300',
                'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
                'border-gray-200/50 dark:border-gray-700/50',
                'hover:shadow-lg hover:border-gray-300/50 dark:hover:border-gray-600/50'
              )}
              whileHover={{ scale: 1.05 }}
            >
              <div className="space-y-3">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', ACCENT_COLORS.purple.bg)}>
                  <Clock className={cn('w-6 h-6', ACCENT_COLORS.purple.icon)} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">16+ Years</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Product & reliability leadership</div>
                </div>
              </div>
            </motion.div>

            {/* ARR Impact Card */}
            <motion.div
              className={cn(
                'p-6 rounded-2xl border transition-all duration-300',
                'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
                'border-gray-200/50 dark:border-gray-700/50',
                'hover:shadow-lg hover:border-gray-300/50 dark:hover:border-gray-600/50'
              )}
              whileHover={{ scale: 1.05 }}
            >
              <div className="space-y-3">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', ACCENT_COLORS.green.bg)}>
                  <DollarSign className={cn('w-6 h-6', ACCENT_COLORS.green.icon)} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">~$30 Million</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">ARR influenced across portfolio</div>
                </div>
              </div>
            </motion.div>

            {/* Domains Card */}
            <motion.div
              className={cn(
                'p-6 rounded-2xl border transition-all duration-300',
                'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
                'border-gray-200/50 dark:border-gray-700/50',
                'hover:shadow-lg hover:border-gray-300/50 dark:hover:border-gray-600/50'
              )}
              whileHover={{ scale: 1.05 }}
            >
              <div className="space-y-3">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', ACCENT_COLORS.green.bg)}>
                  <Award className={cn('w-6 h-6', ACCENT_COLORS.green.icon)} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">15 Domains</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Reliability · Platform · Risk · Product</div>
                </div>
              </div>
            </motion.div>

            {/* Personal Card */}
            <motion.div
              className={cn(
                'p-6 rounded-2xl border transition-all duration-300',
                'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
                'border-gray-200/50 dark:border-gray-700/50',
                'hover:shadow-lg hover:border-gray-300/50 dark:hover:border-gray-600/50'
              )}
              whileHover={{ scale: 1.05 }}
            >
              <div className="space-y-3">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', ACCENT_COLORS.amber.bg)}>
                  <Heart className={cn('w-6 h-6', ACCENT_COLORS.amber.icon)} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">Father of 2</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Based in South Florida</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Journey Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Professional Card */}
            <motion.button
              onClick={() => setIsProfessionalOpen(true)}
              className={cn(
                "group relative rounded-2xl p-6 border transition-all duration-300 text-left",
                "bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm",
                "border-gray-200/50 dark:border-gray-700/50",
                "hover:shadow-lg hover:border-blue-300/50 dark:hover:border-blue-700/50",
                "flex flex-col h-full"
              )}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', ACCENT_COLORS.blue.bg)}>
                    <Briefcase className={cn('w-5 h-5', ACCENT_COLORS.blue.icon)} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Professional Journey</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">From burgers to cloud platforms</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-[120px]">
                  <div className="flex flex-wrap gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700">
                    {[
                      { label: 'Reliability & DR', color: ACCENT_COLORS.blue },
                      { label: 'Platform Delivery', color: ACCENT_COLORS.green },
                      { label: 'Risk & Compliance', color: ACCENT_COLORS.amber },
                      { label: 'Product Leadership', color: ACCENT_COLORS.purple }
                    ].map((item) => (
                      <span
                        key={item.label}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
                          item.color.border,
                          item.color.bg,
                          item.color.text
                        )}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mt-4">
                    {personalInfo?.roles?.[0]?.abbreviatedSummary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', ACCENT_COLORS.blue.border, ACCENT_COLORS.blue.text, ACCENT_COLORS.blue.bg)}>
                    <Award className="w-3 h-3" />
                    <span>15 Core Domains</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white group-hover:gap-2 transition-all">
                    <span>View journey</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Personal Card */}
            <motion.button
              onClick={() => setIsPersonalOpen(true)}
              className={cn(
                "group relative rounded-2xl p-6 border transition-all duration-300 text-left",
                "bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm",
                "border-gray-200/50 dark:border-gray-700/50",
                "hover:shadow-lg hover:border-amber-300/50 dark:hover:border-amber-700/50",
                "flex flex-col h-full"
              )}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', ACCENT_COLORS.amber.bg)}>
                    <Heart className={cn('w-5 h-5', ACCENT_COLORS.amber.icon)} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Personal Story</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">From the Bronx to South Florida</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-[120px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Family</div>
                      <div className="text-xs text-gray-900 dark:text-white mt-0.5">Married, 2 boys</div>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Hometown</div>
                      <div className="text-xs text-gray-900 dark:text-white mt-0.5">Bronx, NY</div>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Location</div>
                      <div className="text-xs text-gray-900 dark:text-white mt-0.5">{personalInfo?.profile?.location}</div>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Pets</div>
                      <div className="text-xs text-gray-900 dark:text-white mt-0.5">{personalInfo?.profile?.pets}</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mt-4">
                    {personalInfo?.profile?.about?.personal?.[0]?.substring(0, 120) || personalInfo?.profile?.about?.businessCard?.substring(0, 120) || 'Learn more about my personal journey'}...
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', ACCENT_COLORS.amber.border, ACCENT_COLORS.amber.text, ACCENT_COLORS.amber.bg)}>
                    <Heart className="w-3 h-3" />
                    <span>Family First</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white group-hover:gap-2 transition-all">
                    <span>Read story</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* Professional Domains & Expertise */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Professional Domains & Expertise
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Capabilities across reliability, platform, product leadership, and risk
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(DOMAIN_CLUSTERS).map(([key, cluster]) => {
                const isActive = selectedFilter === key;
                const color = cluster.color !== 'neutral' ? ACCENT_COLORS[cluster.color as keyof typeof ACCENT_COLORS] : undefined;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedFilter(key)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2',
                      isActive
                        ? color
                          ? cn('text-white dark:text-gray-900', {
                              'bg-blue-600 dark:bg-blue-400': cluster.color === 'blue',
                              'bg-green-600 dark:bg-green-400': cluster.color === 'green',
                              'bg-purple-600 dark:bg-purple-400': cluster.color === 'purple',
                              'bg-amber-600 dark:bg-amber-400': cluster.color === 'amber'
                            })
                          : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                  >
                    {cluster.label}
                  </button>
                );
              })}
            </div>

            {/* Unified Skill Pill Cloud */}
            <motion.div
              className="flex flex-wrap gap-2"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {domainSections.filter((section) =>
                selectedFilter === 'all' ? true : section.cluster === selectedFilter
              ).flatMap((section) => {
                const color = ACCENT_COLORS[section.color as keyof typeof ACCENT_COLORS];
                return section.skills.map((skill) => (
                  <motion.span
                    key={`${section.id}-${skill}`}
                    variants={itemVariants}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-colors',
                      color.border,
                      color.bg,
                      color.text,
                      'hover:shadow-sm hover:border-current'
                    )}
                  >
                    {skill}
                  </motion.span>
                ));
              })}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Professional Drawer */}
      <Sheet.Root open={isProfessionalOpen} onOpenChange={setIsProfessionalOpen}>
        <Sheet.Portal>
          <AnimatePresence>
            {isProfessionalOpen && (
              <>
                <Sheet.Overlay asChild>
                  <motion.div
                    className="fixed inset-0 z-50 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </Sheet.Overlay>

                <Sheet.Content asChild>
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed right-0 top-0 z-50 h-screen w-full sm:max-w-2xl bg-white dark:bg-neutral-950 border-l border-gray-200 dark:border-neutral-800 shadow-2xl focus:outline-none flex flex-col"
                  >
                    <Sheet.Title className="sr-only">Professional Journey</Sheet.Title>
                    <Sheet.Description className="sr-only">
                      Detailed information about professional experience and career journey
                    </Sheet.Description>

                    <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 dark:border-neutral-800', ACCENT_COLORS.blue.bg)}>
                            <Briefcase className={cn('w-6 h-6', ACCENT_COLORS.blue.icon)} />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                              Professional Journey
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              From burgers to cloud platforms
                            </p>
                          </div>
                        </div>
                        <Sheet.Close asChild>
                          <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
                            <X className="w-5 h-5" />
                          </Button>
                        </Sheet.Close>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-8">
                      <div className="space-y-10">
                        {/* My Story */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">My Story</h3>
                          {personalInfo?.profile?.about?.professional?.split('\n\n').map((paragraph: string, index: number) => (
                            <p key={index} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {paragraph}
                            </p>
                          )) || (
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {personalInfo?.profile?.about?.businessCard || 'My professional story'}
                            </p>
                          )}
                        </div>

                        {/* Experience Timeline */}
                        <div className="space-y-6">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Experience</h3>
                          <div className="space-y-4 relative pl-8 border-l border-gray-200 dark:border-neutral-800 ml-3">
                            {personalInfo?.roles?.map((role: RoleInfo, index: number) => (
                              <div key={index} className="relative">
                                <div className="absolute -left-[37px] top-4 w-3 h-3 rounded-full bg-white dark:bg-neutral-950 border-2 border-gray-300 dark:border-neutral-700" />
                                <div className="rounded-xl p-5 border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 hover:border-gray-300 dark:hover:border-neutral-700 transition-all">
                                  <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 bg-white dark:bg-neutral-800 rounded-lg flex items-center justify-center border border-gray-100 dark:border-neutral-700 flex-shrink-0">
                                      <Image
                                        src={companyLogos[role.company] || role.imageUrl}
                                        alt={role.company}
                                        width={32}
                                        height={32}
                                        className="object-contain p-1"
                                        unoptimized={(companyLogos[role.company] || role.imageUrl).endsWith('.svg')}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {role.title}
                                      </h4>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {role.company} • {role.years}
                                      </p>
                                      {ROLE_FOCUS[role.company] && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                          {ROLE_FOCUS[role.company].slice(0, 3).map((focus) => (
                                            <span
                                              key={focus}
                                              className="px-2 py-1 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                                            >
                                              {focus}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                    {role.summary}
                                  </p>
                                  <div className="space-y-3">
                                    <h5 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                      Key Achievements
                                    </h5>
                                    <ul className="space-y-2">
                                      {role.highlights.map((highlight, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                                          <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600 mt-2 flex-shrink-0" />
                                          <span className="leading-relaxed">{highlight}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  {COMPANY_CAREER_URLS[role.company] && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                                      <a
                                        href={COMPANY_CAREER_URLS[role.company]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                      >
                                        <span>Explore {role.company} careers</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Core Competencies */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                            Core Competencies
                          </h3>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {aggregatedThemes.map((theme) => {
                              const color = ACCENT_COLORS[theme.color];
                              const isExpanded = expandedSections[theme.id];
                              const visibleSkills = isExpanded ? theme.skills : getVisibleSkills(theme.skills, 6);
                              const remaining = theme.skills.length - visibleSkills.length;
                              const domainPreview = theme.domains.slice(0, 3);
                              const domainRemainder = theme.domains.length - domainPreview.length;

                              return (
                                <div
                                  key={theme.id}
                                  className={cn(
                                    'rounded-xl border p-4 transition-all h-full flex flex-col gap-3',
                                    'bg-white/70 dark:bg-gray-900/70 border-gray-200/60 dark:border-gray-800/60',
                                    'hover:border-gray-300 dark:hover:border-gray-700'
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <span className={cn('mt-1 h-2 w-2 rounded-full', color.bg)} />
                                      <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                          {theme.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{theme.summary}</p>
                                      </div>
                                    </div>
                                    <span
                                      className={cn(
                                        'text-[11px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide',
                                        color.bg,
                                        color.text,
                                        'border border-white/30 dark:border-gray-800'
                                      )}
                                    >
                                      {theme.id}
                                    </span>
                                  </div>

                                  <div className="space-y-1">
                                    {domainPreview.map((domain) => (
                                      <p key={domain} className="text-xs text-gray-600 dark:text-gray-400">
                                        • {domain}
                                      </p>
                                    ))}
                                    {domainRemainder > 0 && (
                                      <p className="text-xs text-gray-500 dark:text-gray-500">+{domainRemainder} more focus areas</p>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {visibleSkills.map((skill) => (
                                      <span
                                        key={skill}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>

                                  {remaining > 0 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedSections((prev) => ({
                                          ...prev,
                                          [theme.id]: !isExpanded
                                        }))
                                      }
                                      className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white inline-flex items-center gap-2"
                                    >
                                      {isExpanded ? 'Show fewer' : `Show all (${theme.skills.length})`}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Key Methodologies */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                            Key Methodologies
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {['Agile/Scrum', 'Lean Product', 'Systems Thinking', 'Design Thinking', 'Servant Leadership', 'Risk-First Approach'].map((method) => (
                              <div
                                key={method}
                                className="px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                              >
                                {method}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Sheet.Content>
              </>
            )}
          </AnimatePresence>
        </Sheet.Portal>
      </Sheet.Root>

      {/* Personal Drawer */}
      <Sheet.Root open={isPersonalOpen} onOpenChange={setIsPersonalOpen}>
        <Sheet.Portal>
          <AnimatePresence>
            {isPersonalOpen && (
              <>
                <Sheet.Overlay asChild>
                  <motion.div
                    className="fixed inset-0 z-50 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </Sheet.Overlay>

                <Sheet.Content asChild>
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed right-0 top-0 z-50 h-screen w-full sm:max-w-2xl bg-white dark:bg-neutral-950 border-l border-gray-200 dark:border-neutral-800 shadow-2xl focus:outline-none flex flex-col"
                  >
                    <Sheet.Title className="sr-only">Personal Story</Sheet.Title>
                    <Sheet.Description className="sr-only">
                      Detailed information about personal story, values, and background
                    </Sheet.Description>

                    <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 dark:border-neutral-800', ACCENT_COLORS.amber.bg)}>
                            <Heart className={cn('w-6 h-6', ACCENT_COLORS.amber.icon)} />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                              Personal Story
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              The person behind the professional
                            </p>
                          </div>
                        </div>
                        <Sheet.Close asChild>
                          <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
                            <X className="w-5 h-5" />
                          </Button>
                        </Sheet.Close>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-8">
                      <div className="space-y-8">
                        {/* At a Glance */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">At a Glance</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: 'Location', value: personalInfo?.profile?.location, icon: MapPin },
                              { label: 'Family', value: 'Married, 2 boys', icon: User },
                              { label: 'Hometown', value: personalInfo?.profile?.hometown, icon: Home },
                              { label: 'Pets', value: personalInfo?.profile?.pets, icon: Heart }
                            ].map((item) => (
                              <div
                                key={item.label}
                                className={cn(
                                  'rounded-xl p-4 border transition-all',
                                  'bg-white/60 dark:bg-gray-800/60',
                                  'border-gray-200/50 dark:border-gray-700/50'
                                )}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <item.icon className="w-4 h-4 text-gray-400" />
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                                    {item.label}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                  {item.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Roots & Values */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                            Roots & Values
                          </h3>
                          <div className={cn(
                            'rounded-xl p-4 border',
                            'bg-amber-500/5 dark:bg-amber-500/10',
                            'border-amber-500/20 dark:border-amber-500/30'
                          )}>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              Born and raised in the Bronx as a child of Caribbean immigrants. My heritage taught me 
                              the value of hard work, community, and never forgetting where you came from. These roots 
                              ground everything I do—from how I lead teams to how I raise my children.
                            </p>
                          </div>
                        </div>

                        {/* My Journey */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">My Journey</h3>
                          <div className="space-y-4">
                            {personalInfo?.profile?.about?.personal && personalInfo.profile.about.personal.length > 0 ? (
                              personalInfo.profile.about.personal.map((paragraph: string, index: number) => (
                                <p key={index} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {paragraph}
                                </p>
                              ))
                            ) : (
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {personalInfo?.profile?.about?.businessCard || 'My personal journey and story'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Passions */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                            Passions & Interests
                          </h3>
                          <div className="space-y-3">
                            <div className={cn(
                              'rounded-xl p-4 border',
                              'bg-white/60 dark:bg-gray-800/60',
                              'border-gray-200/50 dark:border-gray-700/50'
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">🎤</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Spoken Word Poetry</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Writing and performing since high school. A craft that influences everything I create
                              </p>
                            </div>
                            <div className={cn(
                              'rounded-xl p-4 border',
                              'bg-white/60 dark:bg-gray-800/60',
                              'border-gray-200/50 dark:border-gray-700/50'
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">🏀⚾🏈</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">NYC Sports</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Knicks, Yankees, and Giants. Die-hard fan representing NYC wherever I go
                              </p>
                            </div>
                            <div className={cn(
                              'rounded-xl p-4 border',
                              'bg-white/60 dark:bg-gray-800/60',
                              'border-gray-200/50 dark:border-gray-700/50'
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">✊</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  Advocacy & <span className="inline-flex">
                                    <span className="animate-pulse text-red-500 dark:text-red-400">A</span>
                                    <span className="animate-pulse text-orange-500 dark:text-orange-400" style={{ animationDelay: '0.1s' }}>l</span>
                                    <span className="animate-pulse text-green-500 dark:text-green-400" style={{ animationDelay: '0.2s' }}>l</span>
                                    <span className="animate-pulse text-blue-500 dark:text-blue-400" style={{ animationDelay: '0.3s' }}>y</span>
                                  </span>ship
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Using my platform to amplify voices and create opportunities for underrepresented communities
                              </p>
                            </div>
                            <div className={cn(
                              'rounded-xl p-4 border',
                              'bg-white/60 dark:bg-gray-800/60',
                              'border-gray-200/50 dark:border-gray-700/50'
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">🧠</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Mental Health & Neurodiversity</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Living as AuDHD and raising two boys, one on the spectrum. Building understanding, breaking stigmas, and learning daily lessons about attention, presence, and what it means to truly see and be seen
                              </p>
                            </div>
                            <div className={cn(
                              'rounded-xl p-4 border',
                              'bg-white/60 dark:bg-gray-800/60',
                              'border-gray-200/50 dark:border-gray-700/50'
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">🌍</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Culture & Community</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Understanding how culture shapes belonging, exclusion, and collective identity. From organizational systems to social movements, culture drives what communities become
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Sheet.Content>
              </>
            )}
          </AnimatePresence>
        </Sheet.Portal>
      </Sheet.Root>
    </section>
  );
};

export default React.memo(AboutSection);
