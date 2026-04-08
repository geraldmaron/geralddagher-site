'use client';

import { FolderTree } from 'lucide-react';
import { TaxonomyCRUD } from '@/components/admin/TaxonomyCRUD';

export default function AdminCategoriesPage() {
  return (
    <TaxonomyCRUD
      title="Categories"
      description="Organize posts into categories"
      apiUrl="/api/admin/categories"
      entityName="Category"
      entityNamePlural="Categories"
      icon={FolderTree}
      iconWrapperClassName="bg-purple-500/10"
      iconClassName="text-purple-500"
    />
  );
}
