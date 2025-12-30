'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import { LoadingStatus } from '@/components/core/LoadingStatus';
import { hasArgusAccess } from '@/lib/auth/client-groups';
interface ArgusGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}
export function ArgusGuard({ 
  children, 
  fallback, 
  redirectTo = '/login' 
}: ArgusGuardProps) {
  const router = useRouter();
  const { user, loading, error } = useAuth();
  useEffect(() => {
    if (!loading && !hasArgusAccess(user)) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingStatus
            loading={true}
            variant="heart"
            size="lg"
            message="Checking authorization..."
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(redirectTo)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  if (!hasArgusAccess(user)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingStatus
            loading={true}
            status="error"
            variant="heart"
            size="lg"
            message="Access denied"
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