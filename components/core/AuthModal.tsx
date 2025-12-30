import React, { useState } from 'react';
import { Button } from '@/components/core/Button';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Logger } from '@/lib/utils/logger';
import { useAuth } from '@/lib/auth/provider';
import { useRouter } from 'next/navigation';
import { X, Loader2, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const descriptionId = React.useId();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'on';
    try {
      await signIn(email, password, rememberMe);
      setLoading(false);
      onClose();
      router.push('/admin/dashboard');
    } catch (err: any) {
      Logger.error('AuthModal: Login failed', { error: err?.message, email });
      setLoading(false);
      setError(err?.message || 'Sign in failed. Please try again.');
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild aria-describedby={descriptionId}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="relative">
              {/* Glowing background effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur-2xl opacity-20" />

              {/* Main modal card */}
              <div className="relative bg-white dark:bg-neutral-900 backdrop-blur-xl rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6">
                {/* Close button */}
                <Dialog.Close asChild>
                  <button
                    className="absolute right-4 top-4 p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <Dialog.Title className="text-xl font-bold text-neutral-900 dark:text-white">
                      Sign In
                    </Dialog.Title>
                    <Dialog.Description id={descriptionId} className="text-sm text-neutral-600 dark:text-neutral-400">
                      Access your account
                    </Dialog.Description>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="modal-email"
                      className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="modal-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg",
                        "bg-neutral-50 dark:bg-neutral-800",
                        "border border-neutral-200 dark:border-neutral-700",
                        "text-neutral-900 dark:text-white",
                        "placeholder-neutral-400 dark:placeholder-neutral-500",
                        "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent",
                        "transition-all duration-200"
                      )}
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="modal-password"
                      className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="modal-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        className={cn(
                          "w-full px-4 py-2.5 pr-12 rounded-lg",
                          "bg-neutral-50 dark:bg-neutral-800",
                          "border border-neutral-200 dark:border-neutral-700",
                          "text-neutral-900 dark:text-white",
                          "placeholder-neutral-400 dark:placeholder-neutral-500",
                          "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent",
                          "transition-all duration-200"
                        )}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center">
                    <input
                      id="modal-rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
                    />
                    <label
                      htmlFor="modal-rememberMe"
                      className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Keep me signed in on this device
                    </label>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      >
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
