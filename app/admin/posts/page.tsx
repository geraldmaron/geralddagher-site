'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, FileText, Calendar, Eye, EyeOff, Edit, Trash2, Search, LayoutGrid, List, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/core/Button';
import { cn } from '@/lib/utils';

type Post = {
  id: number;
  title: string;
  slug: string;
  status?: string;
  published_at?: string;
  view_count?: number;
  featured?: boolean;
  author?: any;
  category?: any;
  cover_image?: string | null;
  excerpt?: string | null;
  tags?: { tags_id?: { id: number; name: string } }[];
  is_argus_content?: boolean;
  document_type?: { id: number; name: string; slug: string } | number | null;
  argus_users?: any[];
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
  const [authors, setAuthors] = useState<any[]>([]);

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
          setAuthors(usersData.data.filter((u: any) => u.is_author));
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

      const authorId = typeof post.author === 'object' ? post.author?.id : post.author;
      const matchesAuthor = authorFilter === 'all' || authorId === authorFilter;

      return matchesSearch && matchesStatus && matchesContentType && matchesAuthor;
    });
  }, [posts, searchQuery, statusFilter, contentTypeFilter, authorFilter]);

  const StatusBadge = ({ status }: { status?: string }) => {
    const isPublished = status === 'published';
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        isPublished
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
      )}>
        {isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        {status || 'draft'}
      </span>
    );
  };

  const handleDelete = async (postId: number, title?: string) => {
    const confirmed = typeof window !== 'undefined'
      ? window.confirm(`Delete "${title || 'this post'}"? This cannot be undone.`)
      : true;
    if (!confirmed) return;

    setDeletingId(postId);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to delete post (${res.status})`);
      }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      if (typeof window !== 'undefined') {
        alert((err as Error)?.message || 'Failed to delete post');
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your blog posts and content
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link href="/admin/posts/new">
            <Button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-white px-4 py-2 rounded-xl font-medium transition-all">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={cn(
          'flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border',
          'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
          'border-gray-200/50 dark:border-gray-700/50'
        )}
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm',
              'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'placeholder-gray-500 dark:placeholder-gray-400',
              'transition-all duration-200'
            )}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={cn(
            'px-4 py-2.5 rounded-xl text-sm font-medium',
            'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-all duration-200'
          )}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={contentTypeFilter}
          onChange={(e) => setContentTypeFilter(e.target.value as 'all' | 'regular' | 'argus')}
          className={cn(
            'px-4 py-2.5 rounded-xl text-sm font-medium',
            'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-all duration-200'
          )}
        >
          <option value="all">All Types</option>
          <option value="regular">Regular</option>
          <option value="argus">Argus</option>
        </select>
        <select
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className={cn(
            'px-4 py-2.5 rounded-xl text-sm font-medium',
            'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-all duration-200'
          )}
        >
          <option value="all">All Authors</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.first_name} {author.last_name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-xl border transition-colors',
              viewMode === 'list'
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-300'
                : 'border-gray-200/50 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-xl border transition-colors',
              viewMode === 'grid'
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-300'
                : 'border-gray-200/50 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading posts...</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery || statusFilter !== 'all' || contentTypeFilter !== 'all' || authorFilter !== 'all' ? 'No posts match your filters' : 'No posts yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' || contentTypeFilter !== 'all' || authorFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first post'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && contentTypeFilter === 'all' && authorFilter === 'all' && (
              <Link href="/admin/posts/new">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-medium">
                  Create Your First Post
                </Button>
              </Link>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    'group p-5 rounded-2xl border transition-all duration-200',
                    'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
                    'border-gray-200/50 dark:border-gray-700/50',
                    'hover:bg-white/80 dark:hover:bg-gray-800/80',
                    'hover:shadow-lg hover:shadow-gray-900/5 dark:hover:shadow-gray-900/20',
                    'hover:border-blue-300/50 dark:hover:border-blue-600/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                  <Link
                    href={`/admin/posts/${post.slug || post.id}`}
                    className="flex-1 min-w-0"
                  >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {post.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {post.published_at && (
                          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                          </span>
                        )}
                        {post.is_argus_content && (
                          <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800">
                            🛡️ Argus
                          </span>
                        )}
                        {post.document_type && (
                          <span className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700">
                            {typeof post.document_type === 'object' ? post.document_type.name : post.document_type}
                          </span>
                        )}
                        {post.category && !post.is_argus_content && (
                          <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800">
                            {post.category.name}
                          </span>
                        )}
                        {post.featured && !post.is_argus_content && (
                          <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-800">
                            ⭐ Featured
                          </span>
                        )}
                        {post.view_count !== undefined && (
                          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <Eye className="h-4 w-4" />
                            {post.view_count} views
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-col items-end gap-3">
                      <StatusBadge status={post.status} />
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingId(post.id);
                            const identifier = post.slug || post.id;
                            router.push(`/admin/posts/${identifier}`);
                          }}
                          disabled={editingId === post.id}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                          aria-label="Edit post"
                        >
                          {editingId === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          aria-label="Delete post"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(post.id, post.title);
                          }}
                          disabled={deletingId === post.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border',
                    'bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm',
                    'border-gray-200/60 dark:border-gray-800',
                    'shadow-sm hover:shadow-xl transition-all duration-200'
                  )}
                >
                  <Link
                    href={`/admin/posts/${post.slug || post.id}`}
                    className="block"
                  >
                    <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                      {post.cover_image && (
                        <div className="absolute inset-0">
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={post.status} />
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-xs text-white/80">
                        {post.is_argus_content && (
                          <span className="px-2 py-1 rounded-full bg-blue-500/30 border border-blue-400/50">🛡️ Argus</span>
                        )}
                        {post.document_type && (
                          <span className="px-2 py-1 rounded-full bg-white/15 border border-white/20">
                            {typeof post.document_type === 'object' ? post.document_type.name : post.document_type}
                          </span>
                        )}
                        {post.category && !post.is_argus_content && (
                          <span className="px-2 py-1 rounded-full bg-white/15 border border-white/20">{post.category.name}</span>
                        )}
                        {post.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
                      )}
                    </div>
                  </Link>
                  <div className="px-4 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {post.view_count !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {post.view_count}
                        </span>
                      )}
                      {post.featured && !post.is_argus_content && (
                        <span className="px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Featured</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingId(post.id);
                          const identifier = post.slug || post.id;
                          router.push(`/admin/posts/${identifier}`);
                        }}
                        disabled={editingId === post.id}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Edit post"
                      >
                        {editingId === post.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Delete post"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(post.id, post.title);
                        }}
                        disabled={deletingId === post.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        
        {!loading && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredPosts.length} of {posts.length} posts
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
