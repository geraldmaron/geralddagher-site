'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from './provider';
import { hasAdminAccess, hasArgusAccess } from './client-groups';
import * as Dialog from '@radix-ui/react-dialog';

interface AuthRedirectProps {
  onComplete?: () => void;
}

export function AuthRedirect({ onComplete }: AuthRedirectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [showChoice, setShowChoice] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading || !user || redirecting) {
      return;
    }

    const redirectUser = () => {
      try {
        const isAdmin = hasAdminAccess(user);
        const hasArgus = hasArgusAccess(user);
        const redirectParam = searchParams?.get('redirect');

        if (redirectParam) {
          // Guard against sending non-admins back into admin loop
          if (redirectParam.startsWith('/admin') && !isAdmin) {
            router.push('/');
          } else {
            router.push(redirectParam);
          }
          onComplete?.();
          return;
        }

        if (isAdmin && hasArgus) {
          setShowChoice(true);
          return;
        }

        setRedirecting(true);

        if (isAdmin) {
          router.push('/admin');
        } else if (hasArgus) {
          router.push('/argus');
        } else {
          router.push('/');
        }

        onComplete?.();
      } catch (err) {
        setRedirecting(false);
      }
    };

    const timeoutId = setTimeout(redirectUser, 100);
    return () => clearTimeout(timeoutId);
  }, [user, loading, router, onComplete, redirecting, searchParams]);

  const handleChoice = (destination: 'admin' | 'argus') => {
    const path = destination === 'admin' ? '/admin' : '/argus';
    router.push(path);
    setShowChoice(false);
    onComplete?.();
  };

  if (showChoice) {
    return (
      <Dialog.Root open={true}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl z-50 max-w-md w-full mx-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Choose Your Destination
            </Dialog.Title>
            <Dialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
              You have access to both Admin and Argus. Where would you like to go?
            </Dialog.Description>
            
            <div className="space-y-3">
              <button
                onClick={() => handleChoice('admin')}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Admin Dashboard
              </button>
              
              <button
                onClick={() => handleChoice('argus')}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Argus
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return null;
}

// hasAdminAccess and hasArgusAccess are imported from client-groups
