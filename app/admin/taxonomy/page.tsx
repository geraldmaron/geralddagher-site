'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { FolderTree, Tag as TagIcon, FileType } from 'lucide-react';
import { TaxonomyCRUD } from '@/components/admin/TaxonomyCRUD';
import { cn } from '@/lib/utils';

type Tab = 'categories' | 'tags' | 'document-types';

const TABS: { id: Tab; label: string; description: string }[] = [
  { id: 'categories', label: 'Categories', description: 'Organize posts into categories' },
  { id: 'tags', label: 'Tags', description: 'Organize content with tags' },
  { id: 'document-types', label: 'Document Types', description: 'Manage document type categories' },
];

const TAB_CONFIG: Record<Tab, {
  apiUrl: string;
  entityName: string;
  entityNamePlural: string;
  icon: React.ElementType;
  iconWrapperClassName: string;
  iconClassName: string;
  gridClassName?: string;
}> = {
  categories: {
    apiUrl: '/api/admin/categories',
    entityName: 'Category',
    entityNamePlural: 'Categories',
    icon: FolderTree,
    iconWrapperClassName: 'bg-violet-500/10',
    iconClassName: 'text-violet-400',
    gridClassName: 'sm:grid-cols-2',
  },
  tags: {
    apiUrl: '/api/admin/tags',
    entityName: 'Tag',
    entityNamePlural: 'Tags',
    icon: TagIcon,
    iconWrapperClassName: 'bg-cyan-500/10',
    iconClassName: 'text-cyan-400',
    gridClassName: 'sm:grid-cols-2 lg:grid-cols-3',
  },
  'document-types': {
    apiUrl: '/api/admin/document-types',
    entityName: 'Document Type',
    entityNamePlural: 'Document Types',
    icon: FileType,
    iconWrapperClassName: 'bg-amber-500/10',
    iconClassName: 'text-amber-400',
    gridClassName: 'sm:grid-cols-2',
  },
};

function TaxonomyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) || 'categories';
  const config = TAB_CONFIG[activeTab] || TAB_CONFIG.categories;
  const tabMeta = TABS.find(t => t.id === activeTab) || TABS[0];

  const setTab = (tab: Tab) => {
    router.push(`/admin/taxonomy?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-100 tracking-tight">Taxonomy</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage categories, tags, and document types</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150',
              activeTab === tab.id
                ? 'bg-white/[0.08] text-gray-100 shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <TaxonomyCRUD
        key={activeTab}
        title={tabMeta.label}
        description={tabMeta.description}
        apiUrl={config.apiUrl}
        entityName={config.entityName}
        entityNamePlural={config.entityNamePlural}
        icon={config.icon}
        iconWrapperClassName={config.iconWrapperClassName}
        iconClassName={config.iconClassName}
        gridClassName={config.gridClassName}
        hideHeader={false}
      />
    </div>
  );
}

export default function TaxonomyPage() {
  return (
    <Suspense fallback={<div className="text-gray-500 text-sm">Loading…</div>}>
      <TaxonomyContent />
    </Suspense>
  );
}
