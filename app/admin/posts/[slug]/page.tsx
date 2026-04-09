"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Descendant } from 'slate';
import { Editor } from '@/components/editor/Editor';
import { PostMetadataForm } from '@/components/admin/PostMetadataForm';
import { Button } from '@/components/core/Button';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Save, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useAutosave } from '@/components/editor/hooks/useAutosave';
import { formatDistanceToNow } from 'date-fns';
import { normalizeImageUrls } from '@/lib/utils/normalize-image-urls';
import { cn } from '@/lib/utils';

function extractText(nodes: Descendant[]): string {
  return nodes.map((n: any) => {
    if (n.text !== undefined) return n.text;
    if (n.children) return extractText(n.children);
    return '';
  }).join(' ');
}

function wordCount(nodes: Descendant[]): number {
  const text = extractText(nodes).trim();
  return text ? text.split(/\s+/).length : 0;
}

type PostRecord = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  author?: string | null;
  status?: string | null;
  featured?: boolean | null;
  category?: any;
  tags?: any[];
  cover_image?: string | null;
  published_at?: string | null;
  is_argus_content?: boolean;
  argus_users?: any[];
  document_type?: number | null;
};

export default function EditPostPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [postId, setPostId] = useState<number | null>(null);
  const [content, setContent] = useState<Descendant[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [metadata, setMetadata] = useState({
    title: '',
    excerpt: '',
    slug: '',
    cover_image: null as string | null,
    author: null as string | null,
    category: null as number | null,
    tags: [] as number[],
    featured: false,
    status: 'draft' as 'draft' | 'published' | 'archived',
    published_at: null as string | null,
    is_argus_content: false,
    argus_users: [] as string[],
    document_type: null as number | null
  });

  useEffect(() => {
    if (!params.slug) return;

    const load = async () => {
      setLoading(true);
      try {
        const identifier = decodeURIComponent(String(params.slug));
        
        const [postRes, categoriesRes, tagsRes] = await Promise.all([
          fetch(`/api/admin/posts/${encodeURIComponent(identifier)}`),
          fetch('/api/admin/categories'),
          fetch('/api/admin/tags')
        ]);

        if (!postRes.ok) {
          const errorData = await postRes.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to load post (${postRes.status})`);
        }

        const json = await postRes.json();
        if (!json.data) {
          throw new Error('Post not found');
        }

        const [categoriesData, tagsData] = await Promise.all([
          categoriesRes.json().catch(() => ({ data: [] })),
          tagsRes.json().catch(() => ({ data: [] }))
        ]);

        setCategories(categoriesData.data || []);
        setTags(tagsData.data || []);

        const data = json.data as PostRecord;

        setPostId(data.id);
        
        let parsedContent: Descendant[] = [];
        if (data.content) {
          try {
            parsedContent = typeof data.content === 'string' 
              ? JSON.parse(data.content) 
              : data.content;
            if (!Array.isArray(parsedContent)) {
              parsedContent = [];
            }
            parsedContent = normalizeImageUrls(parsedContent) as Descendant[];
          } catch {
            parsedContent = [];
          }
        }
        setContent(parsedContent);

        const coverImageValue = data.cover_image
          ? (data.cover_image.startsWith('http') || data.cover_image.startsWith('/'))
            ? data.cover_image
            : `/api/assets/${data.cover_image}`
          : null;

        setMetadata({
          title: data.title || '',
          excerpt: data.excerpt || '',
          slug: data.slug || '',
          cover_image: coverImageValue,
          author: typeof data.author === 'object' ? (data.author as any)?.id || null : (data.author || null),
          category: typeof data.category === 'object' ? data.category?.id || null : (data.category ? Number(data.category) : null),
          tags: (data.tags || []).map((t: any) => {
            const tagId = t.tags_id?.id || t.tags_id;
            return typeof tagId === 'number' ? tagId : Number(tagId);
          }),
          featured: data.featured || false,
          status: (data.status as any) || 'draft',
          published_at: data.published_at || null,
          is_argus_content: data.is_argus_content || false,
          argus_users: (data.argus_users || []).map((u: any) => u.directus_users_id || u),
          document_type: typeof data.document_type === 'object' ? (data.document_type as any)?.id || null : (data.document_type || null)
        });
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load post');
        setTimeout(() => {
          router.push('/admin/posts');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.slug, router]);

  const handleSave = async (showToast = true) => {
    if (!postId) return;

    if (!metadata.title.trim()) {
      if (showToast) toast.error('Title is required');
      return;
    }
    if (!metadata.slug.trim()) {
      if (showToast) toast.error('Slug is required');
      return;
    }

    setSaving(true);
    try {
      const coverImageFilename = metadata.cover_image && metadata.cover_image.startsWith('/api/assets/')
        ? metadata.cover_image.replace('/api/assets/', '')
        : metadata.cover_image;

      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metadata,
          cover_image: coverImageFilename,
          content
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save');
      }

      const { data } = await res.json();
      if (showToast) {
        toast.success('Post updated successfully!');
      }

      router.push('/admin/posts');
    } catch (e: any) {
      if (showToast) {
        toast.error(e?.message || 'Failed to save post');
      }
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleAutosave = async (autosaveContent: Descendant[], autosaveMetadata: any) => {
    if (!postId || !autosaveMetadata.title.trim() || !autosaveMetadata.slug.trim()) {
      return;
    }

    const res = await fetch(`/api/admin/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...autosaveMetadata,
        content: autosaveContent
      })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Autosave failed');
    }
  };

  const words = useMemo(() => wordCount(content), [content]);
  const readTime = useMemo(() => Math.max(1, Math.round(words / 200)), [words]);

  const autosave = useAutosave({
    enabled: true,
    delay: 30000,
    onSave: handleAutosave,
    content,
    metadata,
    isDirty: saving ? false : true,
  });

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0b0f] flex flex-col">
        <div className="flex-shrink-0 z-20 bg-[#111318] border-b border-white/[0.06]">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push('/admin/posts')}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-400 hover:bg-white/[0.05] hover:text-gray-200 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            </div>
          </div>
        </div>
        <div className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            <div className="flex-1 w-full min-w-0">
              <div className="h-96 bg-white/[0.03] rounded-xl animate-pulse" />
            </div>
            <div className="hidden xl:block xl:w-96 flex-shrink-0">
              <div className="h-96 bg-white/[0.03] rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!postId) {
    return (
      <div className="fixed inset-0 bg-[#0a0b0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Post not found</p>
          <Button onClick={() => router.push('/admin/posts')}>Back to Posts</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0b0f] flex flex-col">
      <div className="flex-shrink-0 z-20 bg-[#111318] border-b border-white/[0.06]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.push('/admin/posts')}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-400 hover:bg-white/[0.05] hover:text-gray-200 transition-all shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="h-4 w-px bg-white/[0.08] shrink-0" />
              <h1 className="text-sm font-semibold text-gray-200 truncate">Edit Post</h1>
              {words > 0 && (
                <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-600">
                  <span>{words.toLocaleString()} words</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {readTime} min read
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {autosave.isSaving && (
                <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-[11px] text-blue-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving…
                </span>
              )}
              {!autosave.isSaving && autosave.lastSaved && !autosave.error && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {formatDistanceToNow(autosave.lastSaved, { addSuffix: true })}
                </span>
              )}
              {autosave.error && (
                <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-[11px] text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  Autosave failed
                </span>
              )}
              <Button onClick={() => handleSave(true)} loading={saving} size="sm">
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
          <div className="flex flex-col xl:flex-row gap-6 h-full xl:items-stretch">
            <div className="xl:hidden w-full">
              <PostMetadataForm
                data={metadata}
                onChange={(updates) => setMetadata((prev) => ({ ...prev, ...updates }))}
                onSave={handleSave}
                isSaving={saving}
                categories={categories}
                tags={tags}
              />
            </div>

            <div className="flex-1 w-full min-w-0 flex flex-col">
              <Editor
                initialContent={content}
                onChange={setContent}
                metadata={metadata as any}
                onMetadataChange={(meta) =>
                  setMetadata((prev) => ({
                    ...prev,
                    ...meta
                  } as typeof metadata))
                }
                className="flex-1"
              />
            </div>

            <div className="hidden xl:flex xl:w-96 flex-shrink-0">
              <PostMetadataForm
                data={metadata}
                onChange={(updates) => setMetadata((prev) => ({ ...prev, ...updates }))}
                onSave={handleSave}
                isSaving={saving}
                categories={categories}
                tags={tags}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
