'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/core/Button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion';
import BusinessCard from '@/components/core/BusinessCard';
import TypingText from './TypingText';
import { name } from '@/lib/constants';
import Image from 'next/image';

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 16 }
  }
};

const Hero: React.FC = () => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 32]);

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
    if (typeof window === 'undefined') return;
    const openFromHash = () => {
      setIsConnectModalOpen(window.location.hash === '#connect');
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isConnectModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseConnect();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isConnectModalOpen]);

  const handleConnect = () => {
    setIsConnectModalOpen(true);
    if (typeof window !== 'undefined') {
      window.location.hash = 'connect';
    }
  };

  const handleCloseConnect = () => {
    setIsConnectModalOpen(false);
    if (typeof window !== 'undefined') {
      const { pathname, search } = window.location;
      window.history.replaceState(null, '', `${pathname}${search}`);
    }
  };

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contact card"
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-4 sm:p-6 md:p-10"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleCloseConnect}
      />
      <div className="relative z-10 w-full max-w-3xl pt-4 pb-6">
        {personalInfo && (
          <BusinessCard
            profile={personalInfo.profile}
            onClose={handleCloseConnect}
            inModal
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <section
        role="banner"
        aria-label="Introduction"
        className="relative isolate w-full overflow-hidden"
      >
        {/* Background */}
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10"
          style={prefersReducedMotion ? undefined : { y: parallaxY }}
          aria-hidden="true"
        >
          <Image
            src="/images/Hero.png"
            alt={`${name} background`}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/75 to-black/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.25),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.2),transparent_25%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.08),transparent_35%)]" />
        </motion.div>

        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 pb-16 pt-28 text-center sm:px-6 md:pb-24 md:pt-32 lg:pt-36">
          <motion.div
            className="section-panel flex w-full max-w-3xl flex-col items-center space-y-8 border-white/10 bg-slate-950/24 px-6 py-8 shadow-[0_20px_80px_-32px_rgba(15,23,42,0.85)] sm:px-8 sm:py-10"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <TypingText />

            <motion.p
              variants={itemVariants}
              className="max-w-2xl text-xs leading-relaxed text-slate-100/86 sm:text-sm"
            >
              Product and platform leader translating reliability, risk, and delivery discipline into durable business outcomes. I help teams ship fast without breaking trust.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-row items-center gap-3 sm:gap-4"
            >
              <Button
                variant="primary"
                size="md"
                onClick={handleConnect}
                className="shadow-lg shadow-blue-500/25"
              >
                Let&apos;s Connect
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="md"
                className="border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/18"
                onClick={() => {
                  const about = document.querySelector('[data-section="about"]');
                  if (about) about.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See my work <ChevronDown className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1 text-white/46"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>

        {isMounted && isConnectModalOpen && createPortal(modal, document.body)}
      </section>
    </>
  );
};

export default Hero;
