'use client';
import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { TMPForm } from './TMPForm';

import { cn } from '@/lib/utils';
import { useTheme } from '@/components/core/ThemeProvider';
interface TMPFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function TMPFormDialog({ open, onOpenChange }: TMPFormDialogProps) {
  const { isDarkMode } = useTheme();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 bg-black/50 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-6xl h-[90vh] translate-x-[-50%] translate-y-[-50%]',
            'rounded-lg border shadow-lg duration-200',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            isDarkMode
              ? 'bg-gray-900 border-gray-700'
              : 'bg-white border-gray-200'
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 flex items-start justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <Dialog.Title asChild>
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Share Your Story
                  </h2>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
                    Share a bit about yourself and let&apos;s figure out how to best frame your experience(s).
                  </p>
                </Dialog.Description>
              </div>
              <Dialog.Close
                className={cn(
                  'rounded-full p-1.5 transition-colors',
                  'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-4 sm:p-6">
                <TMPForm onSuccess={() => onOpenChange(false)} />
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}