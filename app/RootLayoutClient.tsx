/**
 * Root Layout Client Component
 * 
 * Client-side layout wrapper providing React Query, analytics,
 * toast notifications, and responsive navigation for the application.
 */

'use client';
import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Analytics } from "@vercel/analytics/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Navbar from '@/components/core/Navbar';
import Footer from '@/components/core/Footer';

// React Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface RootLayoutClientProps {
  children: React.ReactNode;
}

/**
 * Root layout client component with providers and navigation
 * 
 * @param children - Child components to render
 * @returns JSX element with layout providers
 */
export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const startTime = useRef(performance.now());

  useEffect(() => {
    const handleResize = () => {
      // Resize handling logic can be added here
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Admin route layout (minimal)
  if (isAdminRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg, #363636)',
              color: 'var(--toast-color, #fff)',
            },
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
          }}
        />
        <Analytics />
      </QueryClientProvider>
    );
  }

  // Main site layout
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-white dark:bg-black relative">
        <Navbar />
        {/* Main content area */}
        <div className="relative">
          {children}
        </div>
        <Footer />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #363636)',
            color: 'var(--toast-color, #fff)',
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
        }}
      />
      <Analytics />
    </QueryClientProvider>
  );
}