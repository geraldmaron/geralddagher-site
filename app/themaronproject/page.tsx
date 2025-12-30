'use client';
import React from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import TMPAbout from '@/components/themaronproject/TMPAbout';
import TMPHowToHelp from '@/components/themaronproject/TMPHowToHelp';
import TMPYouTube from '@/components/themaronproject/TMPYouTube';
import { Logger } from '@/lib/utils/logger';
import type { TMPSubmission } from '@/lib/types/shared';

const fadeVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

const TMPPage: FC = () => {
  const [submissions, setSubmissions] = React.useState<TMPSubmission[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/tmp-submissions');

        if (!response.ok) {
          throw new Error(`Failed to fetch submissions: ${response.status}`);
        }

        const json = await response.json();
        const data = json.data || [];

        setSubmissions(
          data.map((submission: any) => ({
            ...submission,
            contact_preferences: submission.contact_preferences ?? {
              selected_contact_methods: [],
              selected_days: [],
              selected_times: [],
              selected_dates: []
            }
          }))
        );
      } catch (error) {
        Logger.error(
          error instanceof Error ? error.message : String(error),
          {
            operation: 'fetchTMPSubmissions',
            component: 'TMPPage',
            error
          }
        );
        setError('Failed to load submissions. Please try again later.');
      }
    };

    fetchSubmissions();
  }, []);

  if (error) {
    return (
      <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
        <div className="rounded-xl border border-red-200/60 bg-white/80 px-4 py-3 text-sm text-red-600 shadow-sm backdrop-blur dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.2),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.18),transparent_32%),radial-gradient(circle_at_50%_85%,rgba(52,211,153,0.16),transparent_26%)] dark:bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.14),transparent_34%),radial-gradient(circle_at_55%_90%,rgba(52,211,153,0.12),transparent_28%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/60 to-slate-100/70 dark:from-slate-950 dark:via-slate-950/60 dark:to-black/40" />
      </div>

      <motion.div
        key="content"
        className="relative z-10 flex flex-col gap-16 pb-16 pt-10 sm:gap-20 sm:pt-14 md:gap-24 md:pt-16"
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <TMPAbout />

        {submissions.length > 0 && (
          <section className="relative px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 shadow-xl shadow-blue-500/5 ring-1 ring-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:ring-slate-800/70">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-emerald-400/6 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-emerald-300/10" />
                <div className="relative">
                  <TMPYouTube submissions={submissions} />
                </div>
              </div>
            </div>
          </section>
        )}

        <TMPHowToHelp />
      </motion.div>
    </main>
  );
};

export default TMPPage;
