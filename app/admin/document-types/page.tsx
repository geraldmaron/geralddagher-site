'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FileType } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';
import { Modal } from '@/components/core/Modal';

type DocumentType = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  sort?: number;
};

export default function AdminDocumentTypesPage() {
  const [items, setItems] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DocumentType | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/document-types');
    const json = await res.json();
    setItems(json.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingItem ? `/api/admin/document-types/${editingItem.id}` : '/api/admin/document-types';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error();
      toast.success(editingItem ? 'Document type updated' : 'Document type created');
      setIsModalOpen(false);
      setForm({ name: '', slug: '', description: '' });
      setEditingItem(null);
      load();
    } catch {
      toast.error('Failed to save document type');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: DocumentType) => {
    setEditingItem(item);
    setForm({ name: item.name, slug: item.slug, description: item.description || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document type?')) return;
    try {
      const res = await fetch(`/api/admin/document-types/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Document type deleted');
      load();
    } catch {
      toast.error('Failed to delete document type');
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setForm({ name: '', slug: '', description: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Document Types</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage document type categories</p>
        </div>
        <Button onClick={handleCreate} icon={<Plus className="h-4 w-4" />}>
          New Document Type
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="group p-4 bg-card border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                    <FileType className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <Pencil className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Document Type' : 'New Document Type'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm({ ...form, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
            }}
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingItem ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
