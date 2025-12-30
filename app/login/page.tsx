"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff, Shield, Sparkles, ArrowLeft, AlertCircle } from "lucide-react";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { useAuth } from '@/lib/auth/provider';
import { AuthRedirect } from '@/lib/auth/redirect';
import { Button } from '@/components/core/Button';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signOut, user, loading, error: authError } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'on';
    
    try {
      await signIn(email, password, rememberMe);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      setError(null);
    } catch (err: any) {
      setError(err.message || "Sign out failed");
    }
  };

  if (loading) {
    return (
      <AuthErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-blue-500/20 rounded-full animate-pulse" />
              <Loader2 className="relative animate-spin h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto" />
            </div>
            <p className="mt-6 text-lg font-medium text-neutral-700 dark:text-neutral-300">
              Checking authentication...
            </p>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Please wait a moment
            </p>
          </motion.div>
        </div>
      </AuthErrorBoundary>
    );
  }

  if (user) {
    return (
      <AuthErrorBoundary>
        <AuthRedirect />
      </AuthErrorBoundary>
    );
  }

  if (error || authError) {
    return (
      <AuthErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-red-950 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <div className="relative">
              {/* Glowing background effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur-2xl opacity-20" />
              
              <div className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-8 shadow-2xl">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mb-6">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-3">
                  Authentication Error
                </h2>
                
                <p className="text-center text-neutral-600 dark:text-neutral-400 mb-8">
                  {error || authError}
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="primary"
                    className="w-full"
                  >
                    Refresh Page
                  </Button>
                  
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                  
                  <Link href="/">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Homepage
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AuthErrorBoundary>
    );
  }

  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950 flex items-center justify-center p-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full relative z-10"
        >
          {/* Glowing border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur-2xl opacity-20" />
          
          {/* Main card */}
          <div className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-8 shadow-2xl">
            {/* Logo/Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg"
            >
              <Shield className="h-8 w-8 text-white" />
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                Welcome Back
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Sign in to access your admin portal
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              autoComplete="on"
              className="space-y-5"
            >
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  className={cn(
                    "w-full px-4 py-3 rounded-lg",
                    "bg-white dark:bg-neutral-800",
                    "border-2 border-neutral-200 dark:border-neutral-700",
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
                  htmlFor="password"
                  className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    className={cn(
                      "w-full px-4 py-3 pr-12 rounded-lg",
                      "bg-white dark:bg-neutral-800",
                      "border-2 border-neutral-200 dark:border-neutral-700",
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
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
                />
                <label
                  htmlFor="rememberMe"
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
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Back Link */}
              <div className="text-center pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Homepage
                </Link>
              </div>
            </motion.form>
          </div>

          {/* Footer Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6"
          >
            Secured with industry-standard encryption
          </motion.p>
        </motion.div>
      </div>
    </AuthErrorBoundary>
  );
}
