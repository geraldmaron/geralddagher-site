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
      className="relative isolate overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/api/assets/site-assets/230e167.png"
          alt="The Maron Project background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/75 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.25),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.2),transparent_25%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.08),transparent_35%)]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto flex max-w-6xl flex-col gap-12"
      >
        <motion.div variants={titleVariants} className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 shadow-sm backdrop-blur">
            The Maron Project
          </span>
          <h1 className="text-balance text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
            What is{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-300 bg-clip-text font-semibold text-transparent">
              The Maron Project
            </span>
            ?
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-100/90">
            Real people. Real stories. Crafted with care and shared with intention.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl shadow-blue-500/5 backdrop-blur"
          role="article"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-emerald-400/10" />
          <div className="relative space-y-6">
            {tmpContent && tmpContent.split('\n').map((paragraph: string, index: number) => (
              <p key={index} className="text-base leading-relaxed text-slate-100/90">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="relative space-y-6"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl shadow-blue-500/5 backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-emerald-400/10" />
            <div className="relative flex flex-col gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 backdrop-blur w-fit">
                A safe place to speak plainly
              </span>
              <p className="text-base leading-relaxed text-slate-100/90">
                We hold the mic with you—not for you—so your lived experience lands with honesty, nuance, and respect.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                  Human stories over headlines
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                  Recorded with care
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                  Clarity & consent first
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-5 shadow-md shadow-blue-500/5 backdrop-blur"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/6 to-emerald-400/8" />
                <div className="relative space-y-2">
                  <p className="text-sm font-semibold text-white">{highlight.title}</p>
                  <p className="text-sm text-slate-100/90">{highlight.description}</p>
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