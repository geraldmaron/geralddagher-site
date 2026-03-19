'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Badge component for small status and metadata labels.
 * Supports neutral and semantic variants for success, warning, danger, and info states.
 */
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning'
    | 'info'
    | 'neutral';
  className?: string;
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary:
        'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      outline:
        'border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800',
      success:
        'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
      warning:
        'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800',
      info:
        'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800',
      neutral:
        'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800/60 dark:text-gray-200 dark:border-gray-700',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };

