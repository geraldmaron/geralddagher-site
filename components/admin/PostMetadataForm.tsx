'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  Sparkles,
  User
} from 'lucide-react';
import { Button } from '@/components/core/Button';
import { CoverImagePicker } from './CoverImagePicker';
import { cn } from '@/lib/utils';
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
}

interface PostMetadataFormProps {
  data: PostFormData;
  onChange: (data: Partial<PostFormData>) => void;
  onSave: () => void;
  isSaving: boolean;
  categories?: Category[];
  tags?: Tag[];
}

export function PostMetadataForm({ data, onChange, onSave, isSaving, categories: providedCategories, tags: providedTags }: PostMetadataFormProps) {
  const [categories, setCategories] = useState<Category[]>(providedCategories || []);
  const [tags, setTags] = useState<Tag[]>(providedTags || []);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(!providedCategories || !providedTags);
  const [metadataExpanded, setMetadataExpanded] = useState(false);

  useEffect(() => {
    if (providedCategories && providedTags) {
      setCategories(providedCategories);
      setTags(providedTags);
      setLoading(false);
      return;
    }
    loadMetadata();
  }, [providedCategories, providedTags]);

  const loadMetadata = async () => {
    try {
      const [categoriesRes, tagsRes, authorsRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/tags'),
        fetch('/api/admin/users?filter[is_author][_eq]=true'),
      ]);

      const categoriesData = await categoriesRes.json();
      const tagsData = await tagsRes.json();
      const authorsData = await authorsRes.json();

      setCategories(categoriesData.data || []);
      setTags(tagsData.data || []);
      setAuthors(authorsData.data || []);
    } catch (error) {
      toast.error('Failed to load categories and tags');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled';
  }, []);

  const handleTitleChange = (title: string) => {
    onChange({ title });
    if (!data.slug || data.slug === generateSlug(data.title)) {
      onChange({ slug: generateSlug(title) });
    }
  };

  const toggleTag = (tagId: number) => {
    const newTags = data.tags.includes(tagId)
      ? data.tags.filter((id) => id !== tagId)
      : [...data.tags, tagId];
    onChange({ tags: newTags });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full xl:h-full">
      {/* Mobile: Collapsible Metadata Header */}
      <div className="xl:hidden mb-4">
        <button
          onClick={() => setMetadataExpanded(!metadataExpanded)}
          className="w-full bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Post Metadata
            </span>
          </div>
          {metadataExpanded ? (
            <ChevronUp className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          )}
        </button>
      </div>

      <div className={cn("space-y-4 transition-all duration-300 xl:flex-1 xl:overflow-y-auto xl:pr-2", !metadataExpanded && "hidden xl:block")}>
        {/* Cover Image */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Cover Image
          </label>
          <CoverImagePicker
            value={data.cover_image}
            onChange={(url) => onChange({ cover_image: url })}
            onError={(error) => toast.error(error)}
          />
        </motion.div>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Title
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title..."
              className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={data.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              placeholder="post-slug"
              className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Excerpt
            </label>
            <textarea
              value={data.excerpt}
              onChange={(e) => onChange({ excerpt: e.target.value })}
              placeholder="Brief description of the post..."
              rows={3}
              className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
            />
          </div>
        </motion.div>

        {/* Author */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              Author
            </label>
            <select
              value={data.author || ''}
              onChange={(e) => onChange({ author: e.target.value || null })}
              className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm cursor-pointer"
            >
              <option value="">No author</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.first_name} {author.last_name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Category & Tags */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              <FolderOpen className="h-4 w-4 text-blue-600" />
              Category
            </label>
            <select
              value={data.category || ''}
              onChange={(e) => onChange({ category: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm cursor-pointer"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              <TagIcon className="h-4 w-4 text-blue-600" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = data.tags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:shadow-sm'
                    )}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Publishing Options */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              <Star className="h-4 w-4 text-blue-600" />
              Featured Post
            </label>
            <button
              onClick={() => onChange({ featured: !data.featured })}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                data.featured ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                  data.featured ? 'left-6' : 'left-0.5'
                )}
              />
            </button>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              <Eye className="h-4 w-4 text-blue-600" />
              Status
            </label>
            <select
              value={data.status}
              onChange={(e) => onChange({ status: e.target.value as 'draft' | 'published' | 'archived' })}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {data.status === 'published' && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Publish Date
              </label>
              <input
                type="datetime-local"
                value={data.published_at ? new Date(data.published_at).toISOString().slice(0, 16) : ''}
                onChange={(e) => onChange({ published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}
        </motion.div>

        <Button
          onClick={onSave}
          disabled={isSaving || !data.title || !data.slug}
          className="w-full"
          size="sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Post'
          )}
        </Button>
      </div>
    </div>
  );
}
