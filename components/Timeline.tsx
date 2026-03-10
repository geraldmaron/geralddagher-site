'use client';
import type { ComponentType } from 'react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Briefcase, HeartPulse, GraduationCap, Home, Baby, Cross,
  HeartHandshake, Eye, Users, Dog, Cat, Heart, ArrowRight, ArrowLeft,
  ArrowUp, BookOpen, TrendingUp, RefreshCw, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Milestone } from '@/lib/types/shared';

type FilterType = 'all' | 'career' | 'personal' | 'family' | 'education';

const categoryMeta: Record<FilterType, { label: string; icon: ComponentType<{ className?: string }> }> = {
  all: { label: 'All', icon: Sparkles },
  career: { label: 'Career', icon: Briefcase },
  personal: { label: 'Personal', icon: HeartPulse },
  family: { label: 'Family', icon: Home },
  education: { label: 'Education', icon: GraduationCap }
};

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  'baby': Baby,
  'hospital': Activity,
  'medkit': Activity,
  'eye-slash': Eye,
  'sad-tear': Cross,
  'arrow-right': ArrowRight,
  'graduation-cap': GraduationCap,
  'book': BookOpen,
  'briefcase': Briefcase,
  'arrow-up': TrendingUp,
  'procedures': Activity,
  'cross': Cross,
  'cat': Cat,
  'arrow-left': ArrowLeft,
  'dog': Dog,
  'heart': Heart,
  'users': Users,
  'sync': RefreshCw
};

const detectCategory = (milestone: Milestone): FilterType => {
  const event = milestone.event.toLowerCase();
  if (/school|college|university|graduat|degree|study/.test(event)) return 'education';
  if (/married|family|daughter|son|father|mother|home|engaged/.test(event)) return 'family';
  if (/job|work|manager|company|promotion|career|product|started at|working at/.test(event)) return 'career';
  return 'personal';
};

const formatDecade = (year: string) => {
  const y = parseInt(year, 10);
  const decade = Math.floor(y / 10) * 10;
  return `${decade}s`;
};

const categoryColors: Record<FilterType, string> = {
  all: 'bg-primary text-primary-foreground',
  career: 'bg-cyan-600 text-white dark:bg-cyan-500',
  personal: 'bg-purple-600 text-white dark:bg-purple-500',
  family: 'bg-rose-600 text-white dark:bg-rose-500',
  education: 'bg-emerald-600 text-white dark:bg-emerald-500',
};

interface TimelineProps {
  initialMilestones?: Milestone[];
}

export default function Timeline({ initialMilestones = [] }: TimelineProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const milestones = useMemo(() => {
    return [...initialMilestones].sort((a, b) => Number(b.year) - Number(a.year));
  }, [initialMilestones]);

  const filtered = useMemo(() => {
    if (filter === 'all') return milestones;
    return milestones.filter((m) => detectCategory(m) === filter);
  }, [filter, milestones]);

  const grouped = useMemo(() => {
    const buckets: Record<string, Milestone[]> = {};
    filtered.forEach((m) => {
      const decade = formatDecade(m.year);
      if (!buckets[decade]) buckets[decade] = [];
      buckets[decade].push(m);
    });
    return Object.entries(buckets)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([decade, items]) => [decade, items.sort((a, b) => Number(b.year) - Number(a.year))] as const);
  }, [filtered]);

  return (
    <div data-area="about" className="relative overflow-hidden bg-background text-gray-900 dark:text-white py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl animate-breathing-glow" />
        <div className="absolute right-1/4 bottom-20 h-64 w-64 rounded-full bg-rose-500/15 blur-3xl animate-breathing-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white [overflow:visible] pb-2"
            style={{ fontFamily: 'var(--font-display)', lineHeight: '1.25' }}
          >
            Life <em><span className="galaxy-text">Timeline</span></em>
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Key moments across life, career, and family
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {(Object.keys(categoryMeta) as FilterType[]).map((key) => {
              const Icon = categoryMeta[key].icon;
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  aria-pressed={active}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:ring-ring focus-visible:outline-none',
                    active
                      ? categoryColors[key]
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {categoryMeta[key].label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-16 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {grouped.map(([decade, items]) => (
            <div key={decade} className="space-y-6">
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>{decade}</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent" />
                </div>
              </div>

              {/* Alternating layout — center line on desktop */}
              <div className="relative">
                {/* Center line (desktop only) */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gray-300 via-gray-200 to-transparent dark:from-gray-700 dark:via-gray-800 dark:to-transparent" />

                <div className="space-y-6 md:space-y-8">
                  {items.map((m, idx) => {
                    const category = detectCategory(m);
                    const Icon = iconMap[m.icon] || HeartHandshake;
                    const isLeft = idx % 2 === 0;

                    const iconColors: Record<string, string> = {
                      career: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
                      personal: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
                      family: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
                      education: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                    };

                    const iconColor = iconColors[category] || 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400';

                    const dotColors: Record<string, string> = {
                      career: 'bg-cyan-500',
                      personal: 'bg-purple-500',
                      family: 'bg-rose-500',
                      education: 'bg-emerald-500'
                    };

                    const dotColor = dotColors[category] || 'bg-amber-500';

                    return (
                      <motion.div
                        key={`${m.event}-${m.year}-${idx}`}
                        initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(idx * 0.06, 0.4), type: 'spring', stiffness: 200, damping: 25 }}
                        className={cn(
                          'relative md:w-[calc(50%-2rem)]',
                          isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                        )}
                      >
                        {/* Dot on the timeline */}
                        <div className={cn(
                          'hidden md:block absolute top-6 w-3 h-3 rounded-full ring-4 ring-background',
                          dotColor,
                          isLeft ? '-right-[1.875rem]' : '-left-[1.875rem]'
                        )} />

                        <div className="group relative flex gap-4 rounded-2xl border border-gray-200/80 bg-white/80 dark:bg-card/80 backdrop-blur-sm p-5 transition-all duration-300 hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-gray-800/60 dark:hover:border-gray-700">
                          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors", iconColor)}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="text-base font-semibold leading-tight text-gray-900 dark:text-white">{m.event}</h3>
                              <span className="shrink-0 text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{m.year}</span>
                            </div>
                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                              {m.summary}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
