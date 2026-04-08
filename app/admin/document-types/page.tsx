'use client';

import { FileType } from 'lucide-react';
import { TaxonomyCRUD } from '@/components/admin/TaxonomyCRUD';

export default function AdminDocumentTypesPage() {
  return (
    <TaxonomyCRUD
      title="Document Types"
      description="Manage document type categories"
      apiUrl="/api/admin/document-types"
      entityName="Document Type"
      entityNamePlural="Document Types"
      icon={FileType}
      iconWrapperClassName="bg-blue-500/10"
      iconClassName="text-blue-500"
    />
  );
}
