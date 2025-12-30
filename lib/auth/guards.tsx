'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './provider';
import { hasAdminAccess } from './client-groups';
import { LoadingStatus } from '@/components/core/LoadingStatus';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, fallback, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter();
  const { user, loading, error, retryAuth } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingStatus
            loading={true}
            variant="heart"
            size="lg"
            message="Checking authentication..."
            theme="minimal"
            showAsCard={false}
            centered={true}
            minDuration={1000}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-neutral-950 dark:to-blue-950/20">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Authentication Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="font-medium mb-2">If this persists, try:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Refreshing the page (Ctrl+F5 or Cmd+Shift+R)</li>
              <li>Clearing browser cache and cookies</li>
              <li>Checking your internet connection</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={retryAuth}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Authentication
            </button>
            
            <button
              onClick={() => router.push(redirectTo)}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingStatus
            loading={true}
            variant="heart"
            size="lg"
            message="Redirecting to login..."
            theme="minimal"
            showAsCard={false}
            centered={true}
            minDuration={1000}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminGuard({ children, fallback, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter();
  const { user, loading, error, retryAuth } = useAuth();

  useEffect(() => {
    if (!loading && user && !hasAdminAccess(user)) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingStatus
            loading={true}
            variant="heart"
            size="lg"
            message="Checking authentication..."
            theme="minimal"
            showAsCard={false}
            centered={true}
            minDuration={1000}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-neutral-950 dark:to-blue-950/20">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Authentication Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          
          <div className="space-y-3">
            <button
              onClick={retryAuth}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
            >
              Retry Authentication
            </button>
            
            <button
              onClick={() => router.push(redirectTo)}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !hasAdminAccess(user)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingStatus
            loading={true}
            variant="heart"
            size="lg"
            message="Redirecting to login..."
            theme="minimal"
            showAsCard={false}
            centered={true}
            minDuration={1000}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// hasAdminAccess is imported from client-groups
