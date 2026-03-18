'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Milestone } from '@/lib/types/shared';

type FilterType = 'all' | 'career' | 'personal' | 'family' | 'education';

const FILTERS: FilterType[] = ['all', 'career', 'personal', 'family', 'education'];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  career:    { bg: 'bg-blue-500/10',    text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-500/30' },
  personal:  { bg: 'bg-purple-500/10',  text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500/30' },
  family:    { bg: 'bg-rose-500/10',    text: 'text-rose-700 dark:text-rose-300',    border: 'border-rose-500/30' },
  education: { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/30' },
  default:   { bg: 'bg-muted',          text: 'text-muted-foreground',               border: 'border-border' },
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
      .sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10))
      .map(([decade, items]) => [decade, items.sort((a, b) => Number(b.year) - Number(a.year))] as const);
  }, [filtered]);

  return (
    <section
      aria-label="Timeline"
      data-section="timeline"
      className="section-wrapper relative"
    >
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" aria-hidden="true" />

      <div className="section-inner relative">
        <motion.div
          className="flex flex-col gap-4 text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="section-label mx-auto">Timeline</span>
          <h2 className="section-heading">A Life in Moments</h2>
          <p className="section-subheading max-w-xl mx-auto">
            Key milestones across career, family, and personal life
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="py-20 text-center"
            >
              <p className="text-muted-foreground text-sm">No milestones in this category yet.</p>
            </motion.div>
          ) : (
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              {grouped.map(([decade, items]) => (
                <div key={decade}>
                  <motion.div
                    className="flex items-center gap-4 py-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex-1 h-px bg-border/30" />
                    <span className="font-mono text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                      {decade}
                    </span>
                    <div className="flex-1 h-px bg-border/30" />
                  </motion.div>

                  {items.map((m, idx) => {
                    const category = detectCategory(m);
                    const styles = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.default;

                    return (
                      <motion.div
                        key={`${m.event}-${m.year}-${idx}`}
                        className="flex items-start gap-5 py-3 group"
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                      >
                        <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0 w-12">
                          <span className="font-mono text-xs text-muted-foreground/60 tabular-nums leading-none">
                            {m.year}
                          </span>
                          <div className="w-px flex-1 min-h-[20px] bg-border/20" />
                        </div>

                        <div className="flex-shrink-0 pt-[3px]">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border',
                              styles.border,
                              styles.bg,
                              styles.text
                            )}
                          >
                            {category}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {m.event}
                          </p>
                          {m.summary && (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {m.summary}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
