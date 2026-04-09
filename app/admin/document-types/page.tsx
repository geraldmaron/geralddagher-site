import { redirect } from 'next/navigation';

export default function AdminDocumentTypesPage() {
  redirect('/admin/taxonomy?tab=document-types');
}
