'use client';
import { useTheme } from '@/components/core/ThemeProvider';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Suspense, useEffect, useState } from 'react';

const highlights = [
  {
    title: 'Story-first',
    description: 'Every conversation starts with what matters most to you, not a checklist.'
  },
  {
    title: 'Dignity in focus',
    description: 'We keep context, consent, and clarity at the core of how your story is shared.'
  },
  {
    title: 'Crafted delivery',
    description: 'Thoughtful pacing, visual polish, and editing that amplifies—not alters—your voice.'
  }
];

const TMPAbout = () => {
  const { isDarkMode } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [tmpContent, setTmpContent] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setTmpContent(data.profile?.about?.tmp || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const containerVariants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const }
    }
  };

  const titleVariants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const }
    }
  };

  return (
    <section
      role="banner"
      aria-label="About The Maron Project"
      className="relative isolate overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(236,72,153,0.12),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(52,211,153,0.12),transparent_30%)]" />
        <div className={`absolute inset-0 opacity-70 ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-50/70'}`} />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto flex max-w-6xl flex-col gap-12"
      >
        <motion.div variants={titleVariants} className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200">
            The Maron Project
          </span>
          <h1 className="text-balance text-3xl leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            What is{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-400 bg-clip-text font-semibold text-transparent">
              The Maron Project
            </span>
            ?
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Real people. Real stories. Crafted with care and shared with intention.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-blue-500/5 ring-1 ring-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:ring-slate-800"
          role="article"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-emerald-400/10 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-emerald-300/10" />
          <div className="relative space-y-6">
            {tmpContent && tmpContent.split('\n').map((paragraph: string, index: number) => (
              <p key={index} className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="relative space-y-6"
        >
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-blue-500/5 ring-1 ring-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:ring-slate-800">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-emerald-400/10 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-emerald-300/10" />
            <div className="relative flex flex-col gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200 w-fit">
                A safe place to speak plainly
              </span>
              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-200">
                We hold the mic with you—not for you—so your lived experience lands with honesty, nuance, and respect.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 backdrop-blur-sm">
                  Human stories over headlines
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 backdrop-blur-sm">
                  Recorded with care
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 backdrop-blur-sm">
                  Clarity & consent first
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-md shadow-blue-500/5 ring-1 ring-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:ring-slate-800"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/6 to-emerald-400/8" />
                <div className="relative space-y-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{highlight.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TMPAbout;