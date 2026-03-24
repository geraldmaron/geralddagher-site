'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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


const ACCENT_COLORS = {
  blue: {
    icon: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    hover: 'hover:border-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
    leftBorder: 'border-s-2 border-blue-500'
  },
  green: {
    icon: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/40',
    hover: 'hover:border-green-500',
    text: 'text-green-700 dark:text-green-300',
    leftBorder: 'border-s-2 border-green-500'
  },
  purple: {
    icon: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/40',
    hover: 'hover:border-purple-500',
    text: 'text-purple-700 dark:text-purple-300',
    leftBorder: 'border-s-2 border-purple-500'
  },
  amber: {
    icon: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    hover: 'hover:border-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    leftBorder: 'border-s-2 border-amber-500'
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

const MOSAIC_PHOTOS = [
  '/polaroids/LittleMe.jpg',
  '/polaroids/ThrowbackFamily.jpg',
  '/polaroids/MomAndI.jpg',
  '/polaroids/WeddingBelt.jpg',
  '/polaroids/Family.jpg',
  '/polaroids/BabyG.jpg',
  '/polaroids/JamieAndI.jpg',
  '/polaroids/Fro.jpg',
  '/polaroids/Deuces.jpg',
  '/polaroids/reInvent.jpg',
  '/polaroids/MomAndI2.jpg',
  '/polaroids/BrokenFace.jpg',
];

const PASSIONS = [
  { emoji: '🎤', label: 'Spoken Word', desc: 'Writing and performing since high school' },
  { emoji: '✊', label: 'Advocacy', desc: 'Amplifying underrepresented voices' },
  { emoji: '🏀', label: 'NYC Sports', desc: 'Knicks, Yankees, Giants. Die-hard.' },
  { emoji: '🧠', label: 'Neurodiversity', desc: 'AuDHD, raising a neurodiverse family' },
  { emoji: '🌍', label: 'Culture', desc: 'Caribbean roots, Bronx upbringing' },
  { emoji: '❤️', label: 'Family First', desc: 'Father of 2, husband, present partner' }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } }
};

const AboutSection: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [currentKeyword, setCurrentKeyword] = useState(0);
  const [selectedRole, setSelectedRole] = useState(0);
  const [domainSections, setDomainSections] = useState<DomainSection[]>(DOMAIN_SECTIONS);
  const [companyLogos, setCompanyLogos] = useState<Record<string, string>>({});
  const [expandedQuadrants, setExpandedQuadrants] = useState<Record<string, boolean>>({});
  const [photoOrder, setPhotoOrder] = useState<number[]>(() =>
    Array.from({ length: 48 }, (_, i) => i % MOSAIC_PHOTOS.length)
  );

  const keywords: string[] = personalInfo?.profile?.keywords || [];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
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
        if (!response.ok) throw new Error('Failed to fetch company logos');
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
        if (!response.ok) throw new Error('Failed to fetch skills');
        const { data } = await response.json();
        if (data && data.length > 0) setDomainSections(data);
      } catch (error) {
        console.error('Error fetching skills:', error);
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
        if (!group.skills.includes(skill)) group.skills.push(skill);
      });
      group.domains.push(section.title);
    });

    return Array.from(groups.values());
  }, [domainSections]);

  useEffect(() => {
    if (keywords.length < 2) return;
    const interval = setInterval(() => {
      setCurrentKeyword((prev) => (prev + 1) % keywords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [keywords.length]);

  useEffect(() => {
    const order = Array.from({ length: 48 }, () =>
      Math.floor(Math.random() * MOSAIC_PHOTOS.length)
    );
    setPhotoOrder(order);
  }, []);

  const roles: RoleInfo[] = personalInfo?.roles || [];
  const activeRole = roles[selectedRole] ?? null;

  return (
    <section
      role="region"
      aria-label="About me"
      data-section="about"
      className="section-wrapper bg-background !pb-12 sm:!pb-20 lg:!pb-24"
    >
      <div className="section-inner">
        <div className="space-y-20 sm:space-y-24">

          {/* ── SECTION 1 — Header ─────────────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20"
          >
            {/* Left: sticky label + heading + animated keyword */}
            <motion.div variants={itemVariants} className="flex flex-col gap-6 lg:pt-2">
              <div className="section-label self-start">
                <MapPin className="w-3.5 h-3.5" />
                {personalInfo?.profile?.location || 'South Florida'}
              </div>

              <div className="flex flex-col gap-1">
                <h1 className="text-sm font-mono text-muted-foreground tracking-widest uppercase">
                  About Me
                </h1>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                    I&apos;m a
                  </span>
                  <div className="overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentKeyword}
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: '0%', opacity: 1 }}
                        exit={{ y: '-100%', opacity: 0 }}
                        transition={{ duration: 0.38, ease: [0.32, 0, 0.67, 0] }}
                        className="block text-4xl sm:text-5xl font-bold text-primary leading-tight"
                      >
                        {keywords[currentKeyword] === 'Ally' ? (
                          <span className="inline-flex">
                            <span className="animate-pulse text-red-500">A</span>
                            <span className="animate-pulse text-orange-500" style={{ animationDelay: '0.1s' }}>l</span>
                            <span className="animate-pulse text-green-500" style={{ animationDelay: '0.2s' }}>l</span>
                            <span className="animate-pulse text-blue-500" style={{ animationDelay: '0.3s' }}>y</span>
                          </span>
                        ) : (
                          keywords[currentKeyword] || 'Leader'
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Role tags — quick visual scan of what Gerald does */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Platform Engineering',
                  'Site Reliability',
                  'Product Leadership',
                  'Risk & Compliance',
                  'Team Building',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Quick stats row */}
              <div className="flex items-center gap-6 pt-2 border-t border-border/30">
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-bold tabular-nums text-foreground">8+</span>
                  <span className="text-[11px] text-muted-foreground">Years exp.</span>
                </div>
                <div className="w-px h-8 bg-border/40" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-bold tabular-nums text-foreground">15</span>
                  <span className="text-[11px] text-muted-foreground">Domains</span>
                </div>
                <div className="w-px h-8 bg-border/40" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-bold tabular-nums text-foreground">4+</span>
                  <span className="text-[11px] text-muted-foreground">Companies</span>
                </div>
              </div>
            </motion.div>

            {/* Right: bio + pull-quote */}
            <motion.div variants={itemVariants} className="flex flex-col gap-6 justify-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {personalInfo?.profile?.about?.businessCard || ''}
              </p>

              <blockquote className="text-xs font-medium text-foreground/80 border-s-4 border-primary/40 ps-4 not-italic">
                I work at the intersection of reliability and product, where trust is built one deployment at a time.
              </blockquote>

              {/* Tech/tool context chips */}
              <div className="space-y-2">
                <p className="text-[11px] font-mono text-muted-foreground/50 uppercase tracking-widest">Core stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Terraform · IaC', 'AWS · GCP', 'Platform Engineering', 'Internal Dev Platforms', 'Observability · SRE', 'LLMOps · MLOps', 'AIOps'].map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-primary/5 text-primary/70 border border-primary/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── SECTION 2 — Career Rail ────────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="space-y-6"
          >
            <motion.h2 variants={itemVariants} className="text-2xl font-semibold text-foreground tracking-tight">
              Career
            </motion.h2>

            {/* Horizontal scrollable rail */}
            <motion.div variants={itemVariants} className="relative">
              <div
                className="overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >

                {roles.length > 0 ? (
                  <div className="flex items-start gap-0 min-w-max">
                    {roles.map((role, index) => {
                      const isSelected = selectedRole === index;
                      const logoSrc = companyLogos[role.company] || role.imageUrl;
                      const yearStart = role.years.split('–')[0]?.trim() ?? '';
                      const yearEnd = role.years.split('–')[1]?.trim() ?? '';

                      return (
                        <div key={index} className="flex items-start">
                          {/* Node */}
                          <div className="flex flex-col items-center gap-2">
                            <button
                              onClick={() => setSelectedRole(index)}
                              aria-pressed={isSelected}
                              aria-label={`${role.company}: ${role.title}`}
                              className={cn(
                                'w-10 h-10 rounded-full border-2 relative overflow-hidden transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex-shrink-0',
                                isSelected
                                  ? 'border-primary'
                                  : 'bg-muted border-border hover:border-primary/60'
                              )}
                            >
                              {logoSrc && logoSrc !== '/images/company-placeholder.png' ? (
                                <Image
                                  src={logoSrc}
                                  alt={role.company}
                                  fill
                                  className="object-contain p-1.5"
                                  unoptimized={logoSrc.endsWith('.svg')}
                                  sizes="40px"
                                />
                              ) : (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                  {role.company.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </button>

                            <div className="flex flex-col items-center gap-0.5 w-24 text-center">
                              <span
                                className={cn(
                                  'text-xs font-mono leading-tight transition-colors',
                                  isSelected ? 'text-foreground font-semibold' : 'text-muted-foreground'
                                )}
                              >
                                {role.company.length > 14 ? `${role.company.slice(0, 13)}…` : role.company}
                              </span>
                              <span className="text-[10px] text-muted-foreground leading-tight">
                                {yearStart}{yearEnd ? `–${yearEnd}` : ''}
                              </span>
                            </div>
                          </div>

                          {/* Connector line (except after last) */}
                          {index < roles.length - 1 && (
                            <div className="h-px w-10 bg-border/60 mt-4 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-0">
                        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                        {i < 3 && <div className="w-10 h-px bg-muted animate-pulse mx-0" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Role detail panel */}
            <AnimatePresence mode="wait">
              {activeRole && (
                <motion.div
                  key={selectedRole}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="bg-muted/40 border border-border/40 rounded-xl p-6 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <p className="text-base font-semibold text-foreground">
                      {activeRole.company}
                      <span className="text-muted-foreground font-normal mx-2">·</span>
                      {activeRole.title}
                      <span className="text-muted-foreground font-normal mx-2">·</span>
                      <span className="font-mono text-sm text-muted-foreground">{activeRole.years}</span>
                    </p>
                  </div>

                  <div className="h-px bg-border/40" />

                  {activeRole.summary && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {activeRole.summary}
                    </p>
                  )}

                  {activeRole.highlights && activeRole.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
                      {activeRole.highlights.map((highlight, idx) => (
                        <span key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="w-1 h-1 rounded-full bg-primary/60 flex-shrink-0" />
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}

                  {COMPANY_CAREER_URLS[activeRole.company] && (
                    <div className="flex justify-end pt-2">
                      <a
                        href={COMPANY_CAREER_URLS[activeRole.company]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline transition-colors"
                      >
                        {activeRole.company} Careers
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── SECTION 3 — Areas of Expertise (2×2 quadrant grid) ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-1">
                Areas of Expertise
              </h2>
              <p className="text-sm text-muted-foreground">
                Capabilities across reliability, platform, product leadership, and risk
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="border border-border/40 rounded-xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 divide-y divide-border/40 sm:divide-x sm:divide-y-0"
            >
              {/* Row 1 */}
              {aggregatedThemes.slice(0, 2).map((theme) => {
                const color = ACCENT_COLORS[theme.color];
                const isExpanded = expandedQuadrants[theme.id];
                const visibleSkills = isExpanded ? theme.skills : theme.skills.slice(0, 6);
                const remaining = theme.skills.length - 6;
                return (
                  <div key={theme.id} className="p-6 flex flex-col gap-3">
                    <div className={cn('ps-3', color.leftBorder)}>
                      <p className="text-sm font-semibold text-foreground">{theme.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{theme.summary}</p>
                    </div>

                    <div className="h-px bg-border/40" />

                    <ul className="space-y-1">
                      {visibleSkills.map((skill) => (
                        <li key={skill} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="text-muted-foreground/60">·</span>
                          {skill}
                        </li>
                      ))}
                    </ul>

                    {remaining > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedQuadrants((prev) => ({ ...prev, [theme.id]: !isExpanded }))}
                        className="text-xs font-medium text-primary hover:underline self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                      >
                        {isExpanded ? 'Show fewer' : `Show all (${theme.skills.length})`}
                      </button>
                    )}

                    <p className="text-[10px] font-mono text-muted-foreground/60 leading-snug mt-auto">
                      {theme.domains.slice(0, 3).join(' · ')}{theme.domains.length > 3 ? ` · +${theme.domains.length - 3}` : ''}
                    </p>
                  </div>
                );
              })}
            </motion.div>

            {/* Row 2 — separate grid row to handle divide properly */}
            <motion.div
              variants={itemVariants}
              className="border border-border/40 rounded-xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 divide-y divide-border/40 sm:divide-x sm:divide-y-0"
            >
              {aggregatedThemes.slice(2, 4).map((theme) => {
                const color = ACCENT_COLORS[theme.color];
                const isExpanded = expandedQuadrants[theme.id];
                const visibleSkills = isExpanded ? theme.skills : theme.skills.slice(0, 6);
                const remaining = theme.skills.length - 6;

                return (
                  <div key={theme.id} className="p-6 flex flex-col gap-3">
                    <div className={cn('ps-3', color.leftBorder)}>
                      <p className="text-sm font-semibold text-foreground">{theme.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{theme.summary}</p>
                    </div>

                    <div className="h-px bg-border/40" />

                    <ul className="space-y-1">
                      {visibleSkills.map((skill) => (
                        <li key={skill} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="text-muted-foreground/60">·</span>
                          {skill}
                        </li>
                      ))}
                    </ul>

                    {remaining > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedQuadrants((prev) => ({ ...prev, [theme.id]: !isExpanded }))}
                        className="text-xs font-medium text-primary hover:underline self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                      >
                        {isExpanded ? 'Show fewer' : `Show all (${theme.skills.length})`}
                      </button>
                    )}

                    <p className="text-[10px] font-mono text-muted-foreground/60 leading-snug mt-auto">
                      {theme.domains.slice(0, 3).join(' · ')}{theme.domains.length > 3 ? ` · +${theme.domains.length - 3}` : ''}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* ── SECTION 4 — Personal Story — full viewport width ──── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="relative w-full border-t border-border/40 mt-12 sm:mt-16"
      >
        {/* Full-viewport-width mosaic background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 auto-rows-fr">
            {photoOrder.map((photoIdx, i) => (
              <div key={i} className="relative overflow-hidden">
                <Image src={MOSAIC_PHOTOS[photoIdx]} alt="" fill className="object-cover opacity-50" sizes="12vw" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-background/80" />
        </div>

        <div className="section-inner relative z-10 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left: identity narrative */}
            <motion.div variants={itemVariants} className="flex flex-col gap-6">
              <div className="section-label self-start">Personal</div>

              <div className="space-y-4">
                <p className="text-2xl font-bold text-foreground leading-snug">
                  Bronx kid.<br />
                  Caribbean roots.<br />
                  South Florida now.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed border-s-2 border-primary/30 ps-4">
                  {personalInfo?.profile?.about?.personal?.[0] || 'Son of Caribbean immigrants. Built by the Bronx. Shaped by community, culture, and an unshakeable belief that people matter more than systems.'}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/30">
                {[
                  { label: 'Hometown', value: 'Bronx, NY' },
                  { label: 'Based in', value: personalInfo?.profile?.location || 'South Florida' },
                  { label: 'Family', value: 'Married · Father of 2' },
                  { label: 'Pets', value: personalInfo?.profile?.pets || '' },
                ].filter(f => f.value).map(({ label, value }) => (
                  <div key={label} className="flex items-baseline gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest w-16 flex-shrink-0">{label}</span>
                    <span className="text-sm text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: passion layout */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <p className="text-[11px] font-mono text-muted-foreground/50 uppercase tracking-widest">What drives me</p>

              {/* Spoken Word */}
              <div className="relative overflow-hidden rounded-xl p-5 bg-purple-500/20 border border-purple-500/30">
                <p className="text-xs font-mono text-purple-400/70 uppercase tracking-widest mb-1">🎤 Spoken Word</p>
                <p className="text-sm font-semibold text-foreground leading-snug">
                  &ldquo;Words before platforms.<br />Stages before standups.&rdquo;
                </p>
                <p className="text-xs text-muted-foreground mt-2">Writing and performing since high school, the craft that shapes how I communicate everything</p>
              </div>

              {/* Advocacy + NYC Sports */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4 bg-gradient-to-br from-violet-500/20 via-blue-500/15 to-amber-400/15 border border-violet-500/30">
                  <p className="text-base mb-1 mt-1">✊</p>
                  <p className="text-xs font-semibold text-foreground">Advocacy</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">Using my platform to amplify underrepresented voices</p>
                </div>
                <div className="rounded-xl p-4 bg-blue-500/20 border border-blue-500/30">
                  <p className="text-base mb-1">🏀</p>
                  <p className="text-xs font-semibold text-foreground">NYC Sports</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">Knicks. Yankees. Giants. Die-hard, always.</p>
                </div>
              </div>

              {/* Neurodiversity + Culture */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4 bg-amber-500/20 border border-amber-500/30">
                  <p className="text-base mb-1">🧠</p>
                  <p className="text-xs font-semibold text-foreground">Neurodiversity</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">AuDHD. Raising a neurodiverse family. Breaking stigmas daily.</p>
                </div>
                <div className="rounded-xl p-4 bg-muted/60 border border-border/60">
                  <p className="text-base mb-1">🌍</p>
                  <p className="text-xs font-semibold text-foreground">Culture</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">Caribbean roots. Bronx upbringing. Culture shapes everything.</p>
                </div>
              </div>

              {/* Family First */}
              <div className="rounded-xl p-4 bg-green-500/20 border border-green-500/30 flex items-center gap-4">
                <span className="text-2xl flex-shrink-0">❤️</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Family First</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Father of 2. Husband. Present partner. Everything else flows from this.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default React.memo(AboutSection);
