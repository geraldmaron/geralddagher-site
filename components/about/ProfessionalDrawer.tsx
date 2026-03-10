'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import * as Sheet from '@radix-ui/react-dialog';
import Button from '@/components/core/Button';
import {
  ACCENT_COLORS,
  CLUSTER_META,
  COMPANY_CAREER_URLS,
  ROLE_FOCUS,
  DOMAIN_SECTIONS,
  RoleInfo
} from './aboutTypes';

interface ProfessionalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  personalInfo: any;
  companyLogos: Record<string, string>;
}

const ProfessionalDrawer: React.FC<ProfessionalDrawerProps> = ({
  isOpen,
  onClose,
  personalInfo,
  companyLogos
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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

    DOMAIN_SECTIONS.forEach((section) => {
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
  }, []);

  const getVisibleSkills = (skills: string[], limit: number) => skills.slice(0, limit);

  return (
    <Sheet.Root open={isOpen} onOpenChange={onClose}>
      <Sheet.Portal>
        <AnimatePresence>
          {isOpen && (
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
                            From field operations to leading platform reliability and AI/ML-powered operational intelligence
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
  );
};

export default ProfessionalDrawer;
