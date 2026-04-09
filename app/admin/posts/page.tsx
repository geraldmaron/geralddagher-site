'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, FileText, Calendar, Eye, EyeOff, Edit, Trash2, Search, LayoutGrid, List, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Button } from '@/components/core/Button';
import { Badge } from '@/components/core/Badge';
import { ConfirmDialog } from '@/components/core/ConfirmDialog';
import { cn } from '@/lib/utils';

type PostAuthor = { id: string; first_name?: string; last_name?: string; is_author?: boolean };
type PostCategory = { id: number; name: string };
type PostTag = { tags_id?: { id: number; name: string } };
type PostDocumentType = { id: number; name: string; slug: string };

type Post = {
  id: number;
  title: string;
  slug: string;
  status?: string;
  published_at?: string;
  view_count?: number;
  featured?: boolean;
  author?: PostAuthor | string;
  category?: PostCategory;
  cover_image?: string | null;
  excerpt?: string | null;
  tags?: PostTag[];
  is_argus_content?: boolean;
  document_type?: PostDocumentType | number | null;
  argus_users?: string[];
};

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'regular' | 'argus'>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [authors, setAuthors] = useState<PostAuthor[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/posts/list'),
      fetch('/api/admin/users')
    ])
      .then(async ([postsRes, usersRes]) => {
        const postsData = await postsRes.json();
        const usersData = await usersRes.json();

        if (!postsRes.ok || postsData.error) {
          console.error('Posts API error:', postsData);
          setPosts([]);
        } else {
          setPosts(postsData.data || []);
        }

        if (usersRes.ok && usersData.data) {
          setAuthors(usersData.data.filter((u: PostAuthor) => u.is_author));
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return posts.filter((post) => {
      const haystack = [
        post.title,
        post.slug,
        post.excerpt,
        post.category?.name,
        ...(post.tags?.map((t) => t.tags_id?.name) || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = q ? haystack.includes(q) : true;
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;

      const matchesContentType =
        contentTypeFilter === 'all' ||
        (contentTypeFilter === 'argus' && post.is_argus_content === true) ||
        (contentTypeFilter === 'regular' && (post.is_argus_content === false || post.is_argus_content === undefined || post.is_argus_content === null));

      const authorId = typeof post.author === 'object' ? (post.author as PostAuthor)?.id : post.author;
      const matchesAuthor = authorFilter === 'all' || authorId === authorFilter;

      return matchesSearch && matchesStatus && matchesContentType && matchesAuthor;
    });
  }, [posts, searchQuery, statusFilter, contentTypeFilter, authorFilter]);

  const StatusBadge = ({ status }: { status?: string }) => {
    const normalized = (status || 'draft').toLowerCase();
    const isPublished = normalized === 'published';
    const variant = isPublished ? 'success' : 'neutral';
    const Icon = isPublished ? Eye : EyeOff;

    return (
      <Badge variant={variant as any} className="inline-flex items-center gap-1.5">
        <Icon className="h-3 w-3" />
        {normalized || 'draft'}
      </Badge>
    );
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    const { id: postId } = confirmDelete;
    setDeletingId(postId);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to delete post (${res.status})`);
      }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to delete post');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const selectClass = cn(
    'px-2.5 py-1.5 rounded-lg text-xs text-gray-300',
    'bg-white/[0.04] border border-white/[0.08]',
    'focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20',
    'transition-all'
  );

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-lg font-semibold text-gray-100 tracking-tight">Posts</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your blog posts and content</p>
        </div>
        <Link href="/admin/posts/new">
          <Button className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/[0.08] text-gray-200 text-xs px-3 py-1.5 rounded-lg font-medium transition-all">
            <Plus className="h-3.5 w-3.5" />
            New post
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-2 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          <input
            type="text"
            placeholder="Search posts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-9 pr-3 py-1.5 rounded-lg text-xs text-gray-300',
              'bg-white/[0.04] border border-white/[0.08]',
              'focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20',
              'placeholder-gray-600 transition-all'
            )}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select value={contentTypeFilter} onChange={(e) => setContentTypeFilter(e.target.value as 'all' | 'regular' | 'argus')} className={selectClass}>
          <option value="all">All types</option>
          <option value="regular">Regular</option>
          <option value="argus">Argus</option>
        </select>
        <select value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)} className={selectClass}>
          <option value="all">All authors</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.first_name} {author.last_name}
            </option>
          ))}
        </select>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={cn('p-2 rounded-lg border transition-colors', viewMode === 'list' ? 'bg-white/10 border-white/20 text-gray-200' : 'border-white/[0.06] text-gray-600 hover:text-gray-400')}
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn('p-2 rounded-lg border transition-colors', viewMode === 'grid' ? 'bg-white/10 border-white/20 text-gray-200' : 'border-white/[0.06] text-gray-600 hover:text-gray-400')}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
              <p className="text-xs text-gray-600">Loading posts…</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-400 mb-1">
              {searchQuery || statusFilter !== 'all' || contentTypeFilter !== 'all' || authorFilter !== 'all' ? 'No posts match your filters' : 'No posts yet'}
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all' || contentTypeFilter !== 'all' || authorFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first post'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && contentTypeFilter === 'all' && authorFilter === 'all' && (
              <Link href="/admin/posts/new">
                <Button className="bg-white/10 hover:bg-white/15 border border-white/[0.08] text-gray-200 text-xs px-4 py-2 rounded-lg font-medium transition-all">
                  Create your first post
                </Button>
              </Link>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.06] overflow-hidden">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="group flex items-center gap-4 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <Link href={`/admin/posts/${post.slug || post.id}`} className="flex-1 min-w-0 flex items-center gap-4">
                  <FileText className="h-4 w-4 text-gray-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {post.published_at && (
                        <span className="text-[11px] text-gray-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                        </span>
                      )}
                      {post.category && !post.is_argus_content && (
                        <span className="text-[11px] text-gray-600">{post.category.name}</span>
                      )}
                      {post.is_argus_content && (
                        <span className="text-[11px] text-blue-400/80">Argus</span>
                      )}
                      {post.featured && !post.is_argus_content && (
                        <span className="text-[11px] text-amber-400/80">Featured</span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-3 shrink-0">
                  {post.view_count !== undefined && (
                    <span className="hidden sm:flex items-center gap-1 text-[11px] text-gray-600">
                      <Eye className="h-3 w-3" />{post.view_count}
                    </span>
                  )}
                  <StatusBadge status={post.status} />
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.preventDefault(); setEditingId(post.id); router.push(`/admin/posts/${post.slug || post.id}`); }}
                      disabled={editingId === post.id}
                      className="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-white/[0.06] rounded-lg transition-colors"
                      aria-label="Edit post"
                    >
                      {editingId === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); setConfirmDelete({ id: post.id, title: post.title }); }}
                      disabled={deletingId === post.id}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      aria-label="Delete post"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04] hover:bg-white/[0.06] transition-all"
              >
                <Link href={`/admin/posts/${post.slug || post.id}`} className="block">
                  <div className="relative aspect-[16/9] w-full bg-[#161920]">
                    {post.cover_image && (
                      <div className="absolute inset-0">
                        <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover opacity-70" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={post.status} />
                    </div>
                    {post.published_at && (
                      <div className="absolute bottom-2 left-2 text-[11px] text-white/60 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-white transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
                <div className="px-3 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {post.view_count !== undefined && (
                      <span className="flex items-center gap-1 text-[11px] text-gray-600">
                        <Eye className="h-3 w-3" />{post.view_count}
                      </span>
                    )}
                    {post.is_argus_content && <span className="text-[11px] text-blue-400/80">Argus</span>}
                    {post.featured && !post.is_argus_content && <span className="text-[11px] text-amber-400/80">Featured</span>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.preventDefault(); setEditingId(post.id); router.push(`/admin/posts/${post.slug || post.id}`); }}
                      disabled={editingId === post.id}
                      className="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-white/[0.06] rounded-lg transition-colors"
                    >
                      {editingId === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); setConfirmDelete({ id: post.id, title: post.title }); }}
                      disabled={deletingId === post.id}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && (
          <p className="text-[11px] text-gray-600 text-center pt-2">
            {filteredPosts.length} of {posts.length} posts
          </p>
        )}
      </motion.div>

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete post"
        description={`Delete "${confirmDelete?.title || 'this post'}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
