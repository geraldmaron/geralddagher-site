'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const subscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  blog: z.boolean(),
  substack: z.boolean()
}).refine(data => data.blog || data.substack, {
  message: 'Please select at least one subscription type'
});

interface SubscriptionResponse {
  success: boolean;
  message: string;
  substackRedirectUrl?: string;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [blog, setBlog] = useState(false);
  const [substack, setSubstack] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SubscriptionResponse | null>(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const fetchCSRFToken = async () => {
        try {
          const response = await fetch('/api/subscriptions');
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        } catch (error) {
          console.error('Failed to fetch CSRF token:', error);
        }
      };
      fetchCSRFToken();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = subscriptionSchema.safeParse({ email, firstName, lastName, blog, substack });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach(error => {
        if (error.path.length > 0) {
          fieldErrors[error.path[0] as string] = error.message;
        } else {
          fieldErrors.general = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({ email, firstName, lastName, blog, substack })
      });

      if (response.status === 409) {
        setResult({ success: false, message: 'You are already subscribed with this email.' });
        setIsLoading(false);
        return;
      }

      const data: SubscriptionResponse = await response.json();
      setResult(data);

      if (data.success && data.substackRedirectUrl) {
        window.open(data.substackRedirectUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setResult({
        success: false,
        message: 'Failed to process subscription. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setEmail('');
    setFirstName('');
    setLastName('');
    setBlog(false);
    setSubstack(false);
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      handleReset();
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-1/2 top-1/2 z-[9999] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
              >
                <div className="relative p-6">
                  <Dialog.Close asChild>
                    <button
                      onClick={handleClose}
                      disabled={isLoading}
                      className={cn(
                        "absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200",
                        "hover:bg-muted text-muted-foreground hover:text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "disabled:pointer-events-none disabled:opacity-50"
                      )}
                      aria-label="Close subscription modal"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>

                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <Dialog.Title className="text-xl font-semibold text-foreground mb-2">
                      Stay Updated
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-muted-foreground">
                      Choose how you&apos;d like to receive updates from Gerald
                    </Dialog.Description>
                  </div>

                  {!result ? (
                    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Subscription form">
                      <div>
                        <label htmlFor="sub-email" className="block text-sm font-medium text-foreground mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="sub-email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'sub-email-error' : undefined}
                          className={cn(
                            "w-full px-3 py-2 border rounded-lg transition-all duration-200",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
                            "bg-background border-input text-foreground placeholder:text-muted-foreground",
                            errors.email && "border-destructive focus-visible:ring-destructive"
                          )}
                          placeholder="your@email.com"
                          disabled={isLoading}
                        />
                        {errors.email && (
                          <p id="sub-email-error" className="mt-1 text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="sub-firstName" className="block text-sm font-medium text-foreground mb-1.5">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="sub-firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="First name (optional)"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label htmlFor="sub-lastName" className="block text-sm font-medium text-foreground mb-1.5">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="sub-lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Last name (optional)"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <fieldset className="space-y-3">
                        <legend className="text-sm font-medium text-foreground mb-1.5">
                          Subscription Options
                        </legend>

                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={blog}
                            onChange={(e) => setBlog(e.target.checked)}
                            className="w-4 h-4 accent-primary rounded"
                            disabled={isLoading}
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground">Blog Updates</span>
                            <p className="text-xs text-muted-foreground">Get notified when new posts are published</p>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={substack}
                            onChange={(e) => setSubstack(e.target.checked)}
                            className="w-4 h-4 accent-primary rounded"
                            disabled={isLoading}
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground">Substack Newsletter</span>
                            <p className="text-xs text-muted-foreground">Access to deeper professional content</p>
                          </div>
                        </label>

                        {errors.general && (
                          <p role="alert" className="text-sm text-destructive">{errors.general}</p>
                        )}
                      </fieldset>

                      <button
                        type="submit"
                        disabled={isLoading || (!blog && !substack)}
                        className={cn(
                          "w-full py-2 px-4 rounded-lg font-medium transition-all duration-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        )}
                      >
                        {isLoading ? 'Processing...' : 'Subscribe'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className={cn(
                        "inline-flex items-center justify-center w-12 h-12 rounded-full",
                        result.success ? "bg-emerald-500/10" : "bg-destructive/10"
                      )}>
                        {result.success ? (
                          <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-destructive" />
                        )}
                      </div>

                      <div>
                        <h3 className={cn(
                          "text-lg font-semibold mb-2",
                          result.success ? "text-emerald-700 dark:text-emerald-300" : "text-destructive"
                        )}>
                          {result.success ? 'Success!' : 'Error'}
                        </h3>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>

                      <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
