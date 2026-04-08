'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/core/Navbar';
import Footer from '@/components/core/Footer';

const toastStyle = {
  background: 'var(--toast-bg)',
  color: 'var(--toast-color)',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.75rem',
  fontSize: '0.875rem',
  padding: '12px 16px',
};

const toastOptions = {
  duration: 4000,
  style: toastStyle,
  success: { duration: 3000 },
  error: { duration: 5000 },
};

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  if (isAdminRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" toastOptions={toastOptions} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="public-shell flex flex-col min-h-screen bg-background relative">
        <Navbar />
        <div className="relative">
          {children}
        </div>
        <Footer />
      </div>
      <Toaster position="top-right" toastOptions={toastOptions} />
    </QueryClientProvider>
  );
}
