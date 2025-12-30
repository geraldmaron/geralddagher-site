'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faFileLines, faComments, faVideo } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@/components/core/ThemeProvider';
import { usePathname, useSearchParams } from 'next/navigation';
import Button from '@/components/core/Button';

import { TMPFormDialog } from './tmpform/TMPFormDialog';
import TMPQuestions from './TMPQuestions';
import TMPWhatToExpect from './TMPWhatToExpect';

interface Step {
  icon: any;
  title: string;
  description: string;
}

const TMPHowToHelp: React.FC = () => {
  const { isDarkMode } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState({
    isOpen: false,
    activeStep: 0
  });
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [isWhatToExpectOpen, setIsWhatToExpectOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#form') {
        setScrollPosition(window.scrollY);
        setFormState(prev => ({ ...prev, isOpen: true }));
      } else if (window.location.hash === '#questions') {
        setScrollPosition(window.scrollY);
        setIsQuestionsOpen(true);
      } else if (window.location.hash === '#whattoexpect') {
        setScrollPosition(window.scrollY);
        setIsWhatToExpectOpen(true);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleCloseForm = () => {
    setFormState(prev => ({ ...prev, isOpen: false }));

    if (window.location.hash === '#form') {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      window.history.replaceState(null, '', url);
    }
  };

  const handleOpenQuestionsFromWhatToExpect = () => {
    setIsWhatToExpectOpen(false);
    window.history.replaceState(null, '', '#questions');
    setScrollPosition(window.scrollY);
    setIsQuestionsOpen(true);
  };

  const handleHashChange = (hash: string) => {
    window.history.replaceState(null, '', hash);
  };

  const steps: Step[] = [
    {
      icon: faBrain,
      title: 'Share your story',
      description: 'Reflect on what you want to voice and the change you hope it sparks.'
    },
    {
      icon: faFileLines,
      title: 'Connect with us',
      description: 'Fill in a few details so we can prepare the right space for you.'
    },
    {
      icon: faComments,
      title: "Let’s chat",
      description: 'We’ll align on what feels comfortable, then explore the heart of your experience.'
    },
    {
      icon: faVideo,
      title: 'Create impact',
      description: 'Record, refine, and share your story in a format that meets you where you are.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.15,
        staggerChildren: 0.15,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  };

  return (
    <section className="relative isolate overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.2),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(236,72,153,0.16),transparent_32%),radial-gradient(circle_at_50%_85%,rgba(52,211,153,0.14),transparent_30%)]" />
        <div className={`absolute inset-0 opacity-80 ${isDarkMode ? 'bg-slate-950/50' : 'bg-white/70'}`} />
      </div>

      <motion.div
        className="mx-auto flex max-w-6xl flex-col gap-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="space-y-4 text-center">
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
            Join the work
          </span>
          <h2 className="text-3xl leading-tight text-slate-900 dark:text-white sm:text-4xl">
            How can you help?
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600 dark:text-slate-300">
            The most important thing is simple: engage, encourage, and add your voice. When you&apos;re ready to go deeper, here&apos;s what that looks like.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-md shadow-blue-500/5 ring-1 ring-slate-200/60 backdrop-blur transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70 dark:ring-slate-800"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/6 via-purple-500/6 to-emerald-400/6 opacity-80 group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-500 to-emerald-400 text-white shadow-lg shadow-blue-500/30">
                  <FontAwesomeIcon icon={step.icon} />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-white/90 text-xs font-semibold text-slate-900 shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    {index + 1}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 p-1 shadow-2xl ring-1 ring-blue-500/30 dark:border-slate-800 dark:ring-blue-400/30"
        >
          <div className="relative grid gap-8 rounded-[22px] bg-white/90 p-8 shadow-lg backdrop-blur dark:bg-slate-950/70 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
                Ready when you are
              </p>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Let&apos;s make space for your story
              </h3>
              <p className="text-base text-slate-700 dark:text-slate-300">
                Whether you want to start with a few questions, read what the process feels like, or jump straight into sharing, we&apos;ll meet you at the pace that feels right.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={() => {
                    handleHashChange('#form');
                    setScrollPosition(window.scrollY);
                    setFormState({
                      isOpen: true,
                      activeStep: 0
                    });
                    localStorage.removeItem('tmp_form_data');
                  }}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-lg shadow-blue-500/25"
                  aria-label="Share your story form"
                >
                  Share your story
                </Button>
                <Button
                  onClick={() => {
                    handleHashChange('#questions');
                    setScrollPosition(window.scrollY);
                    setIsQuestionsOpen(true);
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-100 sm:w-auto dark:border-slate-600 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                  aria-label="View interview questions"
                >
                  Browse questions
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Consent first</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Virtual friendly</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Flexible scheduling</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-white/60 via-blue-50/70 to-blue-100/70 p-6 shadow-inner dark:border-slate-800/60 dark:from-slate-900/60 dark:via-slate-900/70 dark:to-slate-950">
              <div className="flex h-full flex-col gap-4 rounded-xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Not sure where to start?</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Read what the session feels like or grab the question bank. We&apos;ll keep your scroll position when you close each window.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      handleHashChange('#whattoexpect');
                      setScrollPosition(window.scrollY);
                      setIsWhatToExpectOpen(true);
                    }}
                    variant="secondary"
                    size="md"
                    className="justify-between"
                    aria-label="Open what to expect information"
                  >
                    What to expect
                  </Button>
                  <Button
                    onClick={() => {
                      handleHashChange('#questions');
                      setScrollPosition(window.scrollY);
                      setIsQuestionsOpen(true);
                    }}
                    variant="ghost"
                    size="md"
                    className="justify-between text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    aria-label="View interview questions"
                  >
                    View question bank
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <TMPFormDialog
        open={formState.isOpen}
        onOpenChange={(open: boolean) => setFormState(prev => ({ ...prev, isOpen: open }))}
      />
      <TMPQuestions
        isOpen={isQuestionsOpen}
        onClose={() => setIsQuestionsOpen(false)}
        scrollPosition={scrollPosition}
      />
      <TMPWhatToExpect
        isOpen={isWhatToExpectOpen}
        onClose={() => setIsWhatToExpectOpen(false)}
        onOpenQuestions={handleOpenQuestionsFromWhatToExpect}
      />
    </section>
  );
};

export default TMPHowToHelp;