'use client';
import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  source?: string;
  technical?: boolean;
  resolved?: boolean;
}

export interface ErrorsProps {
  errors: ErrorMessage[];
  onDismiss: (id: string) => void;
}

const typeConfig = {
  error: {
    icon: AlertCircle,
    containerClass: 'bg-card border-l-2 border-destructive',
    iconClass: 'text-destructive',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-card border-l-2 border-amber-500',
    iconClass: 'text-amber-500',
  },
  info: {
    icon: Info,
    containerClass: 'bg-card border-l-2 border-primary',
    iconClass: 'text-primary',
  },
} as const;

const Errors: React.FC<ErrorsProps> = ({ errors, onDismiss }) => {
  if (!errors.length) return null;

  return (
    <div className="fixed bottom-4 end-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {errors.map((error) => {
          const { icon: Icon, containerClass, iconClass } = typeConfig[error.type];
          return (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={cn(
                'flex items-start gap-3 rounded-xl border border-border/60 px-4 py-3',
                'shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12)]',
                'dark:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)]',
                containerClass
              )}
            >
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconClass)} aria-hidden="true" />
              <p className="flex-1 text-sm text-foreground leading-relaxed">{error.message}</p>
              <button
                onClick={() => onDismiss(error.id)}
                className="shrink-0 flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Errors;
