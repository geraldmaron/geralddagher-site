'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Tag as TagIcon,
  FolderOpen,
  Star,
  Eye,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  Settings2,
  User,
  Shield,
  FileType,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/core/Button';
import { CoverImagePicker } from './CoverImagePicker';
import { cn } from '@/lib/utils';
import { generateSlug } from '@/lib/utils/slug';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ArgusUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface DocumentType {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  author: string | null;
  category: number | null;
  tags: number[];
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  is_argus_content: boolean;
  argus_users: string[];
  document_type: number | null;
}

interface PostMetadataFormProps {
  data: PostFormData;
  onChange: (data: Partial<PostFormData>) => void;
  onSave: () => void;
  isSaving: boolean;
  categories?: Category[];
  tags?: Tag[];
}

const inputCls = 'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 transition-colors';
const selectCls = `${inputCls} cursor-pointer`;
const labelCls = 'block text-xs font-medium text-gray-400 mb-1.5';

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06] rounded-t-xl">
      <Icon className="h-3.5 w-3.5 text-gray-500" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</span>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'relative w-10 h-5 rounded-full transition-colors shrink-0',
        checked ? 'bg-blue-500' : 'bg-white/[0.08]'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 bg-white rounded-full shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

export function PostMetadataForm({ data, onChange, onSave, isSaving, categories: providedCategories, tags: providedTags }: PostMetadataFormProps) {
  const [categories, setCategories] = useState<Category[]>(providedCategories || []);
  const [tags, setTags] = useState<Tag[]>(providedTags || []);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [argusUsers, setArgusUsers] = useState<ArgusUser[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(!providedCategories || !providedTags);
  const [metadataExpanded, setMetadataExpanded] = useState(false);

  useEffect(() => {
    if (providedCategories && providedTags) {
      setCategories(providedCategories);
      setTags(providedTags);
      loadMetadata(true);
      return;
    }
    loadMetadata(false);
  }, [providedCategories, providedTags]);

  const loadMetadata = async (skipCategoriesAndTags = false) => {
    try {
      const requests = [];

      if (!skipCategoriesAndTags) {
        requests.push(fetch('/api/admin/categories'));
        requests.push(fetch('/api/admin/tags'));
      }

      requests.push(fetch('/api/admin/users?filter[is_author][_eq]=true'));
      requests.push(fetch('/api/admin/users?filter[has_argus_access][_eq]=true'));
      requests.push(fetch('/api/admin/document-types'));

      const responses = await Promise.all(requests);

      let authorsData, argusUsersData, documentTypesData;

      if (!skipCategoriesAndTags) {
        const categoriesData = await responses[0].json();
        const tagsData = await responses[1].json();
        authorsData = await responses[2].json();
        argusUsersData = await responses[3].json();
        documentTypesData = await responses[4].json();

        setCategories(categoriesData.data || []);
        setTags(tagsData.data || []);
      } else {
        authorsData = await responses[0].json();
        argusUsersData = await responses[1].json();
        documentTypesData = await responses[2].json();
      }

      setAuthors(authorsData.data || []);
      setArgusUsers(argusUsersData.data || []);
      setDocumentTypes(documentTypesData.data || []);
    } catch {
      toast.error('Failed to load metadata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data.is_argus_content && data.document_type !== null) {
      onChange({ document_type: null });
    }
  }, [data.is_argus_content, data.document_type, onChange]);

  const handleTitleChange = (title: string) => {
    onChange({ title });
    if (!data.slug || data.slug === generateSlug(data.title)) {
      onChange({ slug: generateSlug(title) || 'untitled' });
    }
  };

  const toggleTag = (tagId: number) => {
    const newTags = data.tags.includes(tagId)
      ? data.tags.filter((id) => id !== tagId)
      : [...data.tags, tagId];
    onChange({ tags: newTags });
  };

  const toggleArgusUser = (userId: string) => {
    const newUsers = data.argus_users.includes(userId)
      ? data.argus_users.filter((id) => id !== userId)
      : [...data.argus_users, userId];
    onChange({ argus_users: newUsers });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  const selectedTagCount = data.tags.length;

  return (
    <div className="flex flex-col w-full xl:h-full">
      {/* Mobile collapse toggle */}
      <div className="xl:hidden mb-3">
        <button
          onClick={() => setMetadataExpanded(!metadataExpanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] transition-all"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Post Settings</span>
            {selectedTagCount > 0 && (
              <span className="rounded-full bg-blue-500/20 border border-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
                {selectedTagCount} tag{selectedTagCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {metadataExpanded
            ? <ChevronUp className="h-4 w-4 text-gray-500" />
            : <ChevronDown className="h-4 w-4 text-gray-500" />
          }
        </button>
      </div>

      <div className={cn('space-y-3 xl:flex-1 xl:overflow-y-auto xl:pr-0.5', !metadataExpanded && 'hidden xl:block')}>

        {/* Cover Image */}
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <SectionHeader icon={ImageIcon} label="Cover" />
          <div className="p-4">
            <CoverImagePicker
              value={data.cover_image}
              onChange={(url) => onChange({ cover_image: url })}
              onError={(error) => toast.error(error)}
            />
          </div>
        </div>

        {/* Content Info */}
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <SectionHeader icon={FileText} label="Content" />
          <div className="p-4 space-y-3">
            {/* Argus toggle */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-400">Argus Content</span>
              </div>
              <Toggle checked={data.is_argus_content} onChange={() => onChange({ is_argus_content: !data.is_argus_content })} />
            </div>

            <div className="h-px bg-white/[0.05]" />

            <div>
              <label className={labelCls}>Title</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Post title…"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Slug</label>
              <input
                type="text"
                value={data.slug}
                onChange={(e) => onChange({ slug: e.target.value })}
                placeholder="post-slug"
                className={cn(inputCls, 'font-mono text-xs')}
              />
            </div>

            <div>
              <label className={labelCls}>Excerpt</label>
              <textarea
                value={data.excerpt}
                onChange={(e) => onChange({ excerpt: e.target.value })}
                placeholder="Brief description…"
                rows={3}
                className={cn(inputCls, 'resize-none')}
              />
            </div>

            <div>
              <label className={labelCls}>Author</label>
              <select
                value={data.author || ''}
                onChange={(e) => onChange({ author: e.target.value || null })}
                className={selectCls}
                disabled={data.is_argus_content}
              >
                <option value="">No author</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.first_name} {author.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Argus Settings */}
        {data.is_argus_content && (
          <div className="rounded-xl border border-blue-500/20 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/[0.06] border-b border-blue-500/20 rounded-t-xl">
              <Shield className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">Argus Settings</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className={labelCls}>Document Type</label>
                <select
                  value={data.document_type || ''}
                  onChange={(e) => onChange({ document_type: Number(e.target.value) })}
                  className={selectCls}
                >
                  <option value="">Select type…</option>
                  {documentTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={cn(labelCls, 'flex items-center justify-between')}>
                  <span>Argus Users</span>
                  <span className="text-gray-600 font-normal normal-case tracking-normal">empty = all</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {argusUsers.map((user) => {
                    const isSelected = data.argus_users.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        onClick={() => toggleArgusUser(user.id)}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                          isSelected
                            ? 'bg-blue-500 text-white border border-blue-400'
                            : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.07]'
                        )}
                      >
                        {user.first_name} {user.last_name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Taxonomy */}
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <SectionHeader icon={TagIcon} label="Taxonomy" />
          <div className="p-4 space-y-3">
            {!data.is_argus_content && (
              <div>
                <label className={labelCls}>Category</label>
                <select
                  value={data.category || ''}
                  onChange={(e) => onChange({ category: e.target.value ? Number(e.target.value) : null })}
                  className={selectCls}
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className={cn(labelCls, 'flex items-center justify-between')}>
                <span>Tags</span>
                {selectedTagCount > 0 && (
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
                    {selectedTagCount} selected
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {tags.map((tag) => {
                  const isSelected = data.tags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                        isSelected
                          ? 'bg-blue-500 text-white border border-blue-400'
                          : 'bg-white/[0.04] text-gray-400 border border-white/[0.08] hover:bg-white/[0.07]'
                      )}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Publishing */}
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <SectionHeader icon={Eye} label="Publishing" />
          <div className="p-4 space-y-3">
            {!data.is_argus_content && (
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-400">Featured Post</span>
                </div>
                <Toggle checked={data.featured} onChange={() => onChange({ featured: !data.featured })} />
              </div>
            )}

            <div>
              <label className={labelCls}>Status</label>
              <select
                value={data.status}
                onChange={(e) => onChange({ status: e.target.value as PostFormData['status'] })}
                className={selectCls}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {data.status === 'published' && (
              <div>
                <label className={labelCls}>Publish Date</label>
                <input
                  type="datetime-local"
                  value={data.published_at ? new Date(data.published_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => onChange({ published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className={inputCls}
                />
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onSave}
          disabled={isSaving || !data.title || !data.slug}
          className="w-full"
          size="sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              Saving…
            </>
          ) : (
            'Save Post'
          )}
        </Button>
      </div>
    </div>
  );
}
