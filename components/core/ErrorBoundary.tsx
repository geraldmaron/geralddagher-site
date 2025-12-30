/**
 * Error Boundary Component
 * 
 * Global error boundary for catching and handling React errors
 * with specific handling for Appwrite errors and user-friendly fallbacks.
 */

'use client';
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Logger } from '@/lib/utils/logger';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Error fallback component with contextual error messages
 * 
 * @param props - Error boundary props
 * @returns JSX element for error display
 */
function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  React.useEffect(() => {
    Logger.error('Error boundary caught error', {
      error,
      context: { location: 'ErrorBoundary' }
    });
  }, [error]);

  const getErrorMessage = () => {
    if (error.message.includes('Authentication') || error.message.includes('auth')) {
      return 'Authentication error. Please try logging in again.';
    }
    if (error.message.includes('Database') || error.message.includes('database')) {
      return 'Database connection error. Please try again later.';
    }
    if (error.message.includes('Storage') || error.message.includes('storage')) {
      return 'File storage error. Please try again later.';
    }
    if (error.message.includes('Network') || error.message.includes('network')) {
      return 'Network connection error. Please check your internet connection.';
    }
    if (error.message.includes('rate limit') || error.message.includes('too many')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    return 'Something went wrong. Please try again.';
  };

  const getActionText = () => {
    if (error.message.includes('Authentication') || error.message.includes('auth')) {
      return 'Go to Login';
    }
    return 'Try Again';
  };

  const handleAction = () => {
    if (error.message.includes('Authentication') || error.message.includes('auth')) {
      window.location.href = '/login';
    } else {
      resetErrorBoundary();
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            Error
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {getErrorMessage()}
          </p>
          <div className="mt-6">
            <button
              onClick={handleAction}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {getActionText()}
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}
export function ErrorBoundary({ 
  children, 
  fallback = ErrorFallback 
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    Logger.error('Error boundary caught error', {
      error,
      errorInfo,
      context: { location: 'ErrorBoundary' }
    });
  };
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback}
      onError={handleError}
      onReset={() => {
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}