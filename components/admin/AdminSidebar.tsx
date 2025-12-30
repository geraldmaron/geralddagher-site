'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Tag, FolderTree, Users, Inbox, Image, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Posts', href: '/admin/posts', icon: FileText },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Tags', href: '/admin/tags', icon: Tag },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Assets', href: '/admin/assets', icon: Image },
  { name: 'TMP', href: '/admin/tmp-submissions', icon: Inbox },
];

interface AdminSidebarProps {
  userEmail: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-background border border-border shadow-lg"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed top-16 bottom-0 left-0 z-40 bg-background border-r border-border transition-all duration-300",
        "lg:translate-x-0",
        collapsed ? "w-16" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex absolute -right-3 top-4 p-1 rounded-full bg-background border border-border shadow-sm hover:shadow-md transition-shadow"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Admin navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    isActive && 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium',
                    !isActive && 'text-gray-700 dark:text-gray-300',
                    collapsed && 'justify-center'
                  )}
                  title={collapsed ? item.name : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className={cn(
            "p-3 border-t border-border",
            collapsed && "flex flex-col items-center"
          )}>
            {!collapsed && (
              <p className="text-xs text-muted-foreground truncate px-3 py-2">{userEmail}</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
