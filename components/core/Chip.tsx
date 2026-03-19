'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable pill-style chip component for labels, filters, and tags.
 * Supports filled, outlined, and subtle variants with optional interactive behavior.
 */
export type ChipVariant = 'filled' | 'outlined' | 'subtle';
export type ChipColor = 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'gray' | 'neutral';

interface ChipProps extends React.HTMLAttributes<HTMLButtonElement | HTMLSpanElement> {
  variant?: ChipVariant;
  color?: ChipColor;
  size?: 'xs' | 'sm' | 'md';
  as?: 'button' | 'span';
  type?: 'button' | 'submit' | 'reset';
  selected?: boolean;
  icon?: React.ReactNode;
}

export const Chip = React.forwardRef<HTMLButtonElement | HTMLSpanElement, ChipProps>(
  (
    {
      variant = 'subtle',
      color = 'neutral',
      size = 'sm',
      as = 'span',
      selected = false,
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

    const sizeStyles: Record<'xs' | 'sm' | 'md', string> = {
      xs: 'px-2 py-0.5 text-[11px]',
      sm: 'px-3 py-1 text-xs',
      md: 'px-3.5 py-1.5 text-sm',
    };

    const palette: Record<ChipColor, { bg: string; border: string; text: string; filled: string }> = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
        filled: 'bg-blue-600 text-white hover:bg-blue-700',
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-300',
        filled: 'bg-green-600 text-white hover:bg-green-700',
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-700 dark:text-purple-300',
        filled: 'bg-purple-600 text-white hover:bg-purple-700',
      },
      amber: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-800 dark:text-amber-200',
        filled: 'bg-amber-500 text-white hover:bg-amber-600',
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-700 dark:text-red-300',
        filled: 'bg-red-600 text-white hover:bg-red-700',
      },
      gray: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-700',
        text: 'text-gray-700 dark:text-gray-200',
        filled: 'bg-gray-800 text-white hover:bg-gray-700',
      },
      neutral: {
        bg: 'bg-neutral-100 dark:bg-neutral-800',
        border: 'border-neutral-200 dark:border-neutral-700',
        text: 'text-neutral-700 dark:text-neutral-200',
        filled: 'bg-neutral-900 text-white hover:bg-neutral-800',
      },
    };

    const paletteValue = palette[color];

    const variantStyles =
      variant === 'filled' || selected
        ? paletteValue.filled
        : variant === 'outlined'
        ? cn('border bg-transparent', paletteValue.border, paletteValue.text)
        : cn('border bg-opacity-80', paletteValue.bg, paletteValue.border, paletteValue.text);

    const Component = as === 'button' ? 'button' : 'span';

    return (
      <Component
        ref={ref as any}
        className={cn(baseStyles, sizeStyles[size], variantStyles, className)}
        {...props}
      >
        {icon && <span className="flex h-3.5 w-3.5 items-center justify-center">{icon}</span>}
        <span className="truncate">{children}</span>
      </Component>
    );
  }
);

Chip.displayName = 'Chip';

export default Chip;

