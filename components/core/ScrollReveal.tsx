'use client';

import { motion, useReducedMotion, type Variant } from 'framer-motion';
import React from 'react';

type RevealPreset = 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-in';

const presets: Record<RevealPreset, { hidden: Variant; visible: Variant }> = {
  'fade-up': {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-in': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  'scale-in': {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
};

interface ScrollRevealProps {
  children: React.ReactNode;
  preset?: RevealPreset;
  /** Delay in seconds */
  delay?: number;
  /** Duration in seconds (default 0.6) */
  duration?: number;
  /** Viewport amount needed to trigger (default 0.15) */
  amount?: number;
  /** Only animate once (default true) */
  once?: boolean;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export default function ScrollReveal({
  children,
  preset = 'fade-up',
  delay = 0,
  duration = 0.6,
  amount = 0.15,
  once = true,
  className,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const { hidden, visible } = presets[preset];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden,
        visible: {
          ...visible,
          transition: {
            duration,
            delay,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger container — wrap multiple ScrollReveal children
 * for staggered entrance effects.
 */
interface StaggerContainerProps {
  children: React.ReactNode;
  /** Stagger delay between children in seconds (default 0.1) */
  stagger?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  stagger = 0.1,
  className,
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Child item for use inside StaggerContainer.
 */
interface StaggerItemProps {
  children: React.ReactNode;
  preset?: RevealPreset;
  className?: string;
}

export function StaggerItem({
  children,
  preset = 'fade-up',
  className,
}: StaggerItemProps) {
  const { hidden, visible } = presets[preset];

  return (
    <motion.div
      variants={{
        hidden,
        visible: {
          ...visible,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
