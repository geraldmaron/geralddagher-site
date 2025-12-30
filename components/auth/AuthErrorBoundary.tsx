'use client';
import { Component, ErrorInfo, ReactNode } from 'react';
import Button from '@/components/core/Button';
interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}
export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  }
  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };
  private handleLogout = () => {
    window.location.href = '/login';
  };
  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full space-y-4">
            <div  role="alert">
              <strong className="font-bold block">Authentication Error</strong>
              <span className="block sm:inline">
                {this.state.error?.message || 'An unexpected error occurred'}
              </span>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
              <Button onClick={this.handleLogout} variant="primary" color="red">
                Return to Login
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}