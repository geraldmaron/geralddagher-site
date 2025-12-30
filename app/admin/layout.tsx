import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/server-utils';
import Navbar from '@/components/core/Navbar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser();

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-900">
      <Navbar />
      <main className="pt-16 lg:pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
