'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bug, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    const screen = `${window.screen.width}x${window.screen.height}`;
    const viewport = `${window.innerWidth}x${window.innerHeight}`;
    return `UA: ${ua} | Screen: ${screen} | Viewport: ${viewport}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (description.trim().length < 10) {
      toast.error('Please provide a more detailed description (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          pageUrl: window.location.href,
          description: description.trim(),
          browserInfo: getBrowserInfo(),
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit bug report');
      }

      setIsSuccess(true);
      toast.success('Bug report sent! Thank you for helping improve the site.');

      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setIsSuccess(false);
          setName('');
          setEmail('');
          setDescription('');
        }, 300);
      }, 2000);
    } catch (error) {
      toast.error('Failed to send bug report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md"
          >
            <div className={cn(
              'relative rounded-2xl border bg-white p-6 shadow-2xl dark:bg-gray-900',
              'border-gray-200/50 dark:border-gray-800/50'
            )}>
              <button
                onClick={onClose}
                className={cn(
                  'absolute right-4 top-4 rounded-lg p-1.5 transition-colors',
                  'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                  'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                )}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                      <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Thank You!
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Your bug report has been sent successfully.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="mb-6 flex items-center gap-3">
                      <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/20">
                        <Bug className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Report a Bug
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Help improve this site
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="bug-name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                        >
                          Your Name (Optional)
                        </label>
                        <input
                          id="bug-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={cn(
                            'w-full rounded-lg border px-3 py-2 text-sm transition-colors',
                            'border-gray-300 bg-white text-gray-900',
                            'focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20',
                            'dark:border-gray-700 dark:bg-gray-800 dark:text-white',
                            'dark:focus:border-red-400 dark:focus:ring-red-400/20'
                          )}
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="bug-email"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                        >
                          Your Email (Optional)
                        </label>
                        <input
                          id="bug-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={cn(
                            'w-full rounded-lg border px-3 py-2 text-sm transition-colors',
                            'border-gray-300 bg-white text-gray-900',
                            'focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20',
                            'dark:border-gray-700 dark:bg-gray-800 dark:text-white',
                            'dark:focus:border-red-400 dark:focus:ring-red-400/20'
                          )}
                          placeholder="you@example.com"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="bug-description"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                        >
                          What went wrong? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="bug-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                          rows={4}
                          className={cn(
                            'w-full rounded-lg border px-3 py-2 text-sm transition-colors resize-none',
                            'border-gray-300 bg-white text-gray-900',
                            'focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20',
                            'dark:border-gray-700 dark:bg-gray-800 dark:text-white',
                            'dark:focus:border-red-400 dark:focus:ring-red-400/20'
                          )}
                          placeholder="Describe the issue you encountered..."
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Minimum 10 characters
                        </p>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={onClose}
                          disabled={isSubmitting}
                          className={cn(
                            'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                            'border border-gray-300 bg-white text-gray-700',
                            'hover:bg-gray-50',
                            'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300',
                            'dark:hover:bg-gray-700',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                          )}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || description.trim().length < 10}
                          className={cn(
                            'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                            'bg-red-600 text-white',
                            'hover:bg-red-700',
                            'dark:bg-red-500 dark:hover:bg-red-600',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'flex items-center justify-center gap-2'
                          )}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Submit Report'
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
