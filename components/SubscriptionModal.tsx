'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
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
    } catch (error) {
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ 
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        style={{ 
          zIndex: 10001
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6">
          <button
            onClick={handleClose}
            className={cn(
              "absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600",
              "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
              "cursor-pointer"
            )}
            aria-label="Close subscription modal"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Stay Updated
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose how you'd like to receive updates from Gerald
            </p>
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600",
                    "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
                    errors.email && "border-red-500 focus:ring-red-500"
                  )}
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="First name (optional)"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="Last name (optional)"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subscription Options
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blog}
                    onChange={(e) => setBlog(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Blog Updates</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when new posts are published</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={substack}
                    onChange={(e) => setSubstack(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Substack Newsletter</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Access to deeper professional content</p>
                  </div>
                </label>

                {errors.general && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || (!blog && !substack)}
                className={cn(
                  "w-full py-2 px-4 rounded-lg font-medium transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
                  "text-white shadow-sm hover:shadow-md"
                )}
              >
                {isLoading ? 'Processing...' : 'Subscribe'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className={cn(
                "inline-flex items-center justify-center w-12 h-12 rounded-full",
                result.success 
                  ? "bg-green-100 dark:bg-green-900/30" 
                  : "bg-red-100 dark:bg-red-900/30"
              )}>
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              
              <div>
                <h3 className={cn(
                  "text-lg font-semibold mb-2",
                  result.success 
                    ? "text-green-900 dark:text-green-100" 
                    : "text-red-900 dark:text-red-100"
                )}>
                  {result.success ? 'Success!' : 'Error'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{result.message}</p>
              </div>

              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}