'use client';

import { useEffect, useState, ElementType } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';
import { Modal } from '@/components/core/Modal';
import { ConfirmDialog } from '@/components/core/ConfirmDialog';
import { generateSlug } from '@/lib/utils/slug';

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
  hideHeader?: boolean;
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
  hideHeader = false,
}: TaxonomyCRUDProps) {
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaxonomyItem | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setItems(json.data || []);
    } catch {
      toast.error(`Failed to load ${entityNamePlural.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [apiUrl]);

  const filtered = search.trim()
    ? items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.slug.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase())
      )
    : items;

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

  const handleDelete = (id: number) => setConfirmDeleteId(id);

  const handleDeleteConfirmed = async () => {
    if (confirmDeleteId === null) return;
    try {
      const res = await fetch(`${apiUrl}/${confirmDeleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success(`${entityName} deleted`);
      load();
    } catch {
      toast.error(`Failed to delete ${entityName.toLowerCase()}`);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setForm({ name: '', slug: '', description: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-100 tracking-tight">{title}</h1>
              {!loading && (
                <span className="rounded-full bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-gray-400">
                  {items.length}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          </div>
          <Button onClick={handleCreate} icon={<Plus className="h-4 w-4" />}>
            New {entityName}
          </Button>
        </div>
      )}

      {/* Search + create row when header is hidden */}
      {hideHeader && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${entityNamePlural.toLowerCase()}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-8 pr-3 py-1.5 text-sm text-gray-300 placeholder:text-gray-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
            />
          </div>
          {!loading && (
            <span className="shrink-0 rounded-full bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-gray-400">
              {items.length}
            </span>
          )}
          <Button onClick={handleCreate} icon={<Plus className="h-4 w-4" />} size="sm">
            New {entityName}
          </Button>
        </div>
      )}

      {/* Search input when header is visible */}
      {!hideHeader && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${entityNamePlural.toLowerCase()}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-8 pr-3 py-1.5 text-sm text-gray-300 placeholder:text-gray-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
          />
        </div>
      )}

      {loading ? (
        <div className={`grid gap-3 ${gridClassName}`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl animate-pulse">
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-white/[0.06] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/[0.06] rounded w-2/3" />
                  <div className="h-2.5 bg-white/[0.04] rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-600 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          {search ? `No ${entityNamePlural.toLowerCase()} match "${search}"` : `No ${entityNamePlural.toLowerCase()} found.`}
        </div>
      ) : (
        <div className={`grid gap-3 ${gridClassName}`}>
          {filtered.map((item) => (
            <div key={item.id} className="group p-3 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${iconWrapperClassName}`}>
                    <Icon className={`h-3.5 w-3.5 ${iconClassName}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-200 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-600 font-mono mt-0.5">{item.slug}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors">
                    <Pencil className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="h-3.5 w-3.5 text-gray-600 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirmed}
        title={`Delete ${entityName}`}
        description={`This will permanently delete this ${entityName.toLowerCase()}. This cannot be undone.`}
        confirmLabel="Delete"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit ${entityName}` : `New ${entityName}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm({ ...form, name, slug: generateSlug(name) });
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
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
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
