'use client';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const highlights = [
  {
    label: 'Story-first',
    description: 'Every conversation starts with what matters most to you, not a checklist.'
  },
  {
    label: 'Dignity in focus',
    description: 'Context, consent, and clarity at the core of how your story is shared.'
  },
  {
    label: 'Crafted delivery',
    description: 'Thoughtful pacing and editing that amplifies, not alters, your voice.'
  }
];

const TMPAbout = () => {
  const prefersReducedMotion = useReducedMotion();
  const [tmpContent, setTmpContent] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
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
      transition: { staggerChildren: 0.18, delayChildren: 0.15 }
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
      className="relative flex items-start bg-background"
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/api/assets/site-assets/230e167.png"
          alt="The Maron Project background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/75 to-gray-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.25),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.2),transparent_25%)]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8"
      >
        <motion.div variants={titleVariants} className="section-panel max-w-3xl space-y-5 px-6 py-7 sm:px-8 sm:py-8">
          <p className="text-xs font-mono uppercase tracking-widest text-rose-500/80 dark:text-rose-400/80">The Maron Project</p>
          <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Real people.{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 dark:from-blue-400 dark:via-purple-400 dark:to-emerald-300 bg-clip-text text-transparent">
              Real stories.
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-foreground/75">
            Crafted with care and shared with intention. We hold the mic with you, not for you, so your lived experience lands with honesty, nuance, and respect.
          </p>
        </motion.div>

        {tmpContent && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }} className="section-panel max-w-2xl space-y-4 px-6 py-6 sm:px-7">
            <div className="w-8 h-px bg-rose-500/60" />
            {tmpContent.split('\n').filter(p => p.trim()).slice(0, 2).map((paragraph: string, index: number) => (
              <p key={index} className="text-base leading-relaxed text-foreground/80">
                {paragraph}
              </p>
            ))}
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="section-panel px-5 py-6 sm:px-6 sm:py-7">
          <div className="grid gap-6 sm:grid-cols-3">
            {highlights.map((h) => (
              <div key={h.label} className="flex flex-col gap-2 border-l border-white/20 pl-4">
                <p className="text-sm font-semibold text-foreground">{h.label}</p>
                <p className="text-sm text-muted-foreground">{h.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TMPAbout;
