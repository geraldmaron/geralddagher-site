'use client';

import { useEffect, useState, ElementType } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';
import { Modal } from '@/components/core/Modal';

export type TaxonomyItem = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  [key: string]: any;
};

export type TaxonomyCRUDProps = {
  title: string;
  description: string;
  apiUrl: string;
  entityName: string;
  entityNamePlural: string;
  icon: ElementType;
  iconWrapperClassName: string;
  iconClassName: string;
  gridClassName?: string;
};

export function TaxonomyCRUD({
  title,
  description,
  apiUrl,
  entityName,
  entityNamePlural,
  icon: Icon,
  iconWrapperClassName,
  iconClassName,
  gridClassName = 'sm:grid-cols-2',
}: TaxonomyCRUDProps) {
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaxonomyItem | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setItems(json.data || []);
    } catch (e) {
      toast.error(`Failed to load ${entityNamePlural.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [apiUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingItem ? `${apiUrl}/${editingItem.id}` : apiUrl;
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error();
      toast.success(editingItem ? `${entityName} updated` : `${entityName} created`);
      setIsModalOpen(false);
      setForm({ name: '', slug: '', description: '' });
      setEditingItem(null);
      load();
    } catch {
      toast.error(`Failed to save ${entityName.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: TaxonomyItem) => {
    setEditingItem(item);
    setForm({ name: item.name, slug: item.slug, description: item.description || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete this ${entityName.toLowerCase()}?`)) return;
    try {
      const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success(`${entityName} deleted`);
      load();
    } catch {
      toast.error(`Failed to delete ${entityName.toLowerCase()}`);
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
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <Button onClick={handleCreate} icon={<Plus className="h-4 w-4" />}>
          New {entityName}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border rounded-lg">
          No {entityNamePlural.toLowerCase()} found.
        </div>
      ) : (
        <div className={`grid gap-3 ${gridClassName}`}>
          {items.map((item) => (
            <div key={item.id} className="group p-4 bg-card border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${iconWrapperClassName}`}>
                    <Icon className={`h-4 w-4 ${iconClassName}`} />
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit ${entityName}` : `New ${entityName}`}>
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
