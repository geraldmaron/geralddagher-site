'use client';

import { Tag as TagIcon } from 'lucide-react';
import { TaxonomyCRUD } from '@/components/admin/TaxonomyCRUD';

export default function AdminTagsPage() {
  return (
    <TaxonomyCRUD
      title="Tags"
      description="Organize content with tags"
      apiUrl="/api/admin/tags"
      entityName="Tag"
      entityNamePlural="Tags"
      icon={TagIcon}
      iconWrapperClassName="bg-blue-500/10"
      iconClassName="text-blue-500"
      gridClassName="sm:grid-cols-2 lg:grid-cols-3"
    />
  );
}
