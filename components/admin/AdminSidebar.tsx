'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  ImageIcon,
  Layers,
  Users,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
};

type NavGroup = {
  heading?: string;
  items: NavItem[];
};

const NAV: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    heading: 'Content',
    items: [
      { label: 'Posts', href: '/admin/posts', icon: FileText },
      { label: 'Assets', href: '/admin/assets', icon: ImageIcon },
    ],
  },
  {
    heading: 'Taxonomy',
    items: [
      { label: 'Taxonomy', href: '/admin/taxonomy', icon: Layers },
    ],
  },
  {
    heading: 'People',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
    ],
  },
  {
    heading: 'Submissions',
    items: [
      { label: 'TMP', href: '/admin/tmp-submissions', icon: Inbox },
    ],
  },
];

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-blue-500/[0.12] text-white'
          : 'text-gray-400 hover:bg-white/[0.05] hover:text-gray-200',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-400/70 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
      )}
    </Link>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('admin-sidebar-collapsed');
    if (stored !== null) setCollapsed(stored === 'true');
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('admin-sidebar-collapsed', String(next));
  };

  const sidebarContent = (isMobile = false) => (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex items-center border-b border-white/[0.06] py-3',
          collapsed && !isMobile ? 'justify-center px-3' : 'justify-between px-4'
        )}
      >
        {(!collapsed || isMobile) && (
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-white hover:text-gray-200 transition-colors"
            onClick={isMobile ? () => setMobileOpen(false) : undefined}
          >
            <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.7)] shrink-0" />
            <span className="text-base tracking-tight">gerald dagher</span>
          </Link>
        )}
        {collapsed && !isMobile && (
          <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
        )}
        {!isMobile && (
          <button
            onClick={toggleCollapsed}
            className={cn(
              'rounded-md p-1.5 text-gray-500 hover:bg-white/[0.06] hover:text-gray-300 transition-all',
              collapsed && 'mx-auto mt-2'
            )}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-white/[0.06] hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-3' : ''}>
            {group.heading && !collapsed && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                {group.heading}
              </p>
            )}
            {group.heading && collapsed && !isMobile && (
              <div className="my-2 mx-auto h-px w-6 bg-white/[0.08]" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed && !isMobile}
                  onClick={isMobile ? () => setMobileOpen(false) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn('border-t border-white/[0.06] p-2', collapsed && !isMobile && 'flex justify-center')}>
        <Link
          href="/"
          target="_blank"
          title={collapsed && !isMobile ? 'View site' : undefined}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-white/[0.05] hover:text-gray-400 transition-all',
            collapsed && !isMobile && 'justify-center px-2'
          )}
          onClick={isMobile ? () => setMobileOpen(false) : undefined}
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          {(!collapsed || isMobile) && <span>View site</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col shrink-0 h-screen bg-[#111318] border-r border-white/[0.06] overflow-hidden"
      >
        {sidebarContent(false)}
      </motion.aside>

      {/* Mobile: hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 rounded-lg bg-[#111318] border border-white/[0.06] p-2 text-gray-400 hover:text-gray-200 transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile: drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#111318] border-r border-white/[0.06]"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
