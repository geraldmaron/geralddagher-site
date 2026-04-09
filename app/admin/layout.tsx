import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/server-utils';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser();

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-[#0a0b0f] text-gray-100 overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 py-5 pt-12 md:pt-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
