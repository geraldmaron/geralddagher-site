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
  error: { icon: AlertCircle, border: 'border-l-4 border-red-500', iconClass: 'text-red-500' },
  warning: { icon: AlertTriangle, border: 'border-l-4 border-yellow-500', iconClass: 'text-yellow-500' },
  info: { icon: Info, border: 'border-l-4 border-blue-500', iconClass: 'text-blue-500' },
} as const;

const Errors: React.FC<ErrorsProps> = ({ errors, onDismiss }) => {
  if (!errors.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {errors.map((error) => {
          const { icon: Icon, border, iconClass } = typeConfig[error.type];
          return (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className={cn(
                'mb-4 p-4 rounded-lg shadow-lg bg-popover text-popover-foreground',
                border
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className={cn('mr-3 w-5 h-5', iconClass)} aria-hidden="true" />
                  <span>{error.message}</span>
                </div>
                <button
                  onClick={() => onDismiss(error.id)}
                  className="ml-4 p-1 rounded-full hover:bg-muted"
                  aria-label="Dismiss error"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Errors;
