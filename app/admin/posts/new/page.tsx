"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Descendant } from 'slate';
import { Editor } from '@/components/editor/Editor';
import { PostMetadataForm } from '@/components/admin/PostMetadataForm';
import { Button } from '@/components/core/Button';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useAutosave } from '@/components/editor/hooks/useAutosave';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth/provider';

const EMPTY_CONTENT: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
];

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
      } catch (e) {
      }
    }
  }, []);

  useEffect(() => {
    if (!postId && (content !== EMPTY_CONTENT || metadata.title !== '')) {
      const draft = { content, metadata };
      localStorage.setItem('new_post_draft', JSON.stringify(draft));
    }
  }, [content, metadata, postId]);

  const handleSave = async () => {
    if (!metadata.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!metadata.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    setSaving(true);
    try {
      if (postId) {
        const res = await fetch(`/api/admin/posts/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...metadata,
            content: JSON.stringify(content)
          })
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to save');
        }

        const { data } = await res.json();
        toast.success('Post updated successfully!');
        window.history.replaceState(null, '', `/admin/posts/${data.slug}`);
      } else {
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...metadata,
            content: JSON.stringify(content)
          })
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to save');
        }

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
    if (!autosaveMetadata.title.trim() || !autosaveMetadata.slug.trim()) {
      return;
    }

    if (postId) {
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
    } else {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
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
    <div className="fixed inset-0 bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      <div className="flex-shrink-0 z-20 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Post Editor
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {autosave.isSaving && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}

              {!autosave.isSaving && autosave.lastSaved && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Save className="h-4 w-4" />
                  <span>Saved {formatDistanceToNow(autosave.lastSaved, { addSuffix: true })}</span>
                </div>
              )}

              {autosave.error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <span>Autosave failed - will retry</span>
                </div>
              )}
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
