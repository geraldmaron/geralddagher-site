"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Descendant } from 'slate';
import { Editor } from '@/components/editor/Editor';
import { PostMetadataForm } from '@/components/admin/PostMetadataForm';
import { Button } from '@/components/core/Button';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Save, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useAutosave } from '@/components/editor/hooks/useAutosave';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth/provider';
import { cn } from '@/lib/utils';

const EMPTY_CONTENT: Descendant[] = [
  { type: 'paragraph', children: [{ text: '' }] }
];

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

function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200));
}

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [postId, setPostId] = useState<number | null>(null);
  const [content, setContent] = useState<Descendant[]>(EMPTY_CONTENT);
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
    seo_title: null as string | null,
    seo_description: null as string | null,
    seo_keywords: null as string | null,
    is_argus_content: false,
    argus_users: [] as string[],
    document_type: null as number | null
  });

  const words = useMemo(() => wordCount(content), [content]);
  const readTime = useMemo(() => readingMinutes(words), [words]);

  useEffect(() => {
    if (user?.id && !metadata.author) {
      setMetadata(prev => ({ ...prev, author: user.id }));
    }
  }, [user?.id, metadata.author]);

  useEffect(() => {
    const savedDraft = localStorage.getItem('new_post_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.content) setContent(parsed.content);
        if (parsed.metadata) {
          setMetadata(prev => ({
            ...prev,
            ...parsed.metadata,
            author: parsed.metadata.author || prev.author
          }));
        }
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!postId && (content !== EMPTY_CONTENT || metadata.title !== '')) {
      localStorage.setItem('new_post_draft', JSON.stringify({ content, metadata }));
    }
  }, [content, metadata, postId]);

  const handleSave = async () => {
    if (!metadata.title.trim()) { toast.error('Title is required'); return; }
    if (!metadata.slug.trim()) { toast.error('Slug is required'); return; }

    setSaving(true);
    try {
      if (postId) {
        const res = await fetch(`/api/admin/posts/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...metadata, content: JSON.stringify(content) })
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to save'); }
        const { data } = await res.json();
        toast.success('Post updated successfully!');
        window.history.replaceState(null, '', `/admin/posts/${data.slug}`);
      } else {
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...metadata, content: JSON.stringify(content) })
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to save'); }
        const { data } = await res.json();
        setPostId(data.id);
        toast.success('Post created successfully!');
        localStorage.removeItem('new_post_draft');
        window.history.replaceState(null, '', `/admin/posts/${data.slug}`);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleAutosave = async (autosaveContent: Descendant[], autosaveMetadata: any) => {
    if (!autosaveMetadata.title.trim() || !autosaveMetadata.slug.trim()) return;

    if (postId) {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...autosaveMetadata, content: autosaveContent })
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Autosave failed'); }
    } else {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...autosaveMetadata, content: autosaveContent })
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Autosave failed'); }
      const { data } = await res.json();
      setPostId(data.id);
      localStorage.removeItem('new_post_draft');
      window.history.replaceState(null, '', `/admin/posts/${data.slug}`);
    }
  };

  const autosave = useAutosave({
    enabled: metadata.title.trim().length > 0,
    delay: 30000,
    onSave: handleAutosave,
    content,
    metadata,
    isDirty: true,
  });

  return (
    <div className="fixed inset-0 bg-[#0a0b0f] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 z-20 bg-[#111318] border-b border-white/[0.06]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-400 hover:bg-white/[0.05] hover:text-gray-200 transition-all shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="h-4 w-px bg-white/[0.08] shrink-0" />
              <h1 className="text-sm font-semibold text-gray-200 truncate">New Post</h1>
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
              {/* Autosave pill */}
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

              <Button onClick={handleSave} loading={saving} size="sm">
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
              />
            </div>

            <div className="flex-1 w-full min-w-0 flex flex-col">
              <Editor
                initialContent={content}
                onChange={setContent}
                metadata={metadata as any}
                onMetadataChange={(meta) =>
                  setMetadata((prev) => ({ ...prev, ...meta } as typeof metadata))
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
