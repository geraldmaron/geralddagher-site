'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Check, X, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/core/Button';
import { cn } from '@/lib/utils';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$%^&*()-_=+)', test: (p) => /[!@#$%^&*()\-_=+]/.test(p) }
];

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const errorMap: Record<string, string> = {};
          data.errors.forEach((err: any) => {
            errorMap[err.field] = err.message;
          });
          setErrors(errorMap);
        }
        toast.error(data.error || 'Failed to change password');
        return;
      }

      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allRequirementsMet = passwordRequirements.every(req => req.test(newPassword));
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Change Password
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Update your password to keep your account secure
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={cn(
                'w-full pl-10 pr-10 py-2.5 rounded-lg text-sm',
                'bg-neutral-50 dark:bg-neutral-800 border',
                errors.currentPassword
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                  : 'border-neutral-200 dark:border-neutral-700 focus:ring-blue-500',
                'focus:outline-none focus:ring-2 focus:border-transparent',
                'transition-all'
              )}
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={cn(
                'w-full pl-10 pr-10 py-2.5 rounded-lg text-sm',
                'bg-neutral-50 dark:bg-neutral-800 border',
                errors.newPassword
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                  : 'border-neutral-200 dark:border-neutral-700 focus:ring-blue-500',
                'focus:outline-none focus:ring-2 focus:border-transparent',
                'transition-all'
              )}
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.newPassword}
            </p>
          )}

          {newPassword && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Password requirements:
              </p>
              {passwordRequirements.map((req, idx) => {
                const isMet = req.test(newPassword);
                return (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {isMet ? (
                      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                    )}
                    <span className={cn(
                      isMet ? 'text-green-600 dark:text-green-400' : 'text-neutral-600 dark:text-neutral-400'
                    )}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(
                'w-full pl-10 pr-10 py-2.5 rounded-lg text-sm',
                'bg-neutral-50 dark:bg-neutral-800 border',
                errors.confirmPassword
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                  : 'border-neutral-200 dark:border-neutral-700 focus:ring-blue-500',
                'focus:outline-none focus:ring-2 focus:border-transparent',
                'transition-all'
              )}
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.confirmPassword}
            </p>
          )}
          {confirmPassword && !passwordsMatch && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              Passwords do not match
            </p>
          )}
          {confirmPassword && passwordsMatch && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <Check className="h-3.5 w-3.5" />
              <span>Passwords match</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setErrors({});
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || !allRequirementsMet || !passwordsMatch || !currentPassword}
          >
            {isSubmitting ? 'Changing Password...' : 'Change Password'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
