'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface ConfirmationState {
  status: 'loading' | 'success' | 'error' | 'expired';
  message: string;
  email?: string;
}

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<ConfirmationState>({
    status: 'loading',
    message: 'Confirming your subscription...'
  });

  useEffect(() => {
    if (!token) {
      setState({
        status: 'error',
        message: 'Missing confirmation token. Please check your email for the complete link.'
      });
      return;
    }

    const confirmSubscription = async () => {
      try {
        const response = await fetch(`/api/subscriptions/confirm?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setState({
            status: 'success',
            message: data.message,
            email: data.email
          });
        } else {
          if (response.status === 410) {
            setState({
              status: 'expired',
              message: data.message
            });
          } else {
            setState({
              status: 'error',
              message: data.message || 'Failed to confirm subscription'
            });
          }
        }
      } catch (error) {
        setState({
          status: 'error',
          message: 'Network error. Please try again or contact support.'
        });
      }
    };

    confirmSubscription();
  }, [token]);

  const renderContent = () => {
    switch (state.status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{state.message}</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscription Confirmed!</h1>
            <p className="text-lg text-gray-600 mb-8">{state.message}</p>
            <div className="space-y-4">
              <Link 
                href="/"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Visit My Blog
              </Link>
              <div className="text-sm text-gray-500">
                You'll receive updates at: <span className="font-medium">{state.email}</span>
              </div>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Link Expired</h1>
            <p className="text-lg text-gray-600 mb-8">{state.message}</p>
            <div className="space-y-4">
              <Link 
                href="/"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Subscribe Again
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Confirmation Failed</h1>
            <p className="text-lg text-gray-600 mb-8">{state.message}</p>
            <div className="space-y-4">
              <Link 
                href="/"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </Link>
              <p className="text-sm text-gray-500">
                If the problem persists, please contact support
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {renderContent()}
      </div>
    </div>
  );
}
