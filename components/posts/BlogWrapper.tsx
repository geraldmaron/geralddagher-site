'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Grid3X3, List, Mail, ArrowRight } from 'lucide-react';
import Button from '@/components/core/Button';
import { cn } from '@/lib/utils';
import { getSafeImageUrl } from '@/lib/utils/imageUtils';
import PostCard from './PostCard';
import BlogFilters from './BlogFilters';
import BlogPagination from './BlogPagination';
import BlogSkeleton from './BlogSkeleton';
import type { PostData } from '@/lib/types/shared';
import type { Category, Tag } from '@/lib/types/database';
import { PostStatus } from '@/lib/types/database';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/lib/auth/provider';
import SubscriptionModal from '@/components/SubscriptionModal';

interface BlogWrapperProps {
  initialPosts: PostData[];
  initialTotal?: number;
  categories: Category[];
  tags: Tag[];
  isAdmin?: boolean;
  onEditPost?: (postId: string) => void;
  onDeletePost?: (postId: string) => Promise<void>;
}

type PostWithReadingTime = PostData & { reading_time?: number };

export default function BlogWrapper({
  initialPosts,
  initialTotal,
  categories,
  tags,
  isAdmin,
  onEditPost,
  onDeletePost
}: BlogWrapperProps) {
  useAuth();
  const effectiveIsAdmin = Boolean(isAdmin);
  const [posts, setPosts] = useState<PostData[]>(initialPosts);
  const [totalPosts, setTotalPosts] = useState(initialTotal ?? initialPosts.length);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<PostStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const MAX_RETRIES = 3;
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const handleSearchChange = useCallback((newSearchQuery: string) => {
    setSearchQuery(newSearchQuery);
  }, []);
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        status: effectiveIsAdmin ? (selectedStatus[0] === PostStatus.Published ? 'published' : 'draft') : 'published',
      });

      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }
      if (selectedCategory) {
        params.append('categoryId', selectedCategory);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const result = await response.json();
      setPosts(result.data || []);
      setTotalPosts(result.total ?? result.data?.length ?? 0);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => setRetryCount(prev => prev + 1), 1000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    itemsPerPage,
    currentPage,
    debouncedSearchQuery,
    selectedCategory,
    selectedTags,
    selectedStatus,
    effectiveIsAdmin,
    retryCount
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategory, selectedTags, selectedStatus, itemsPerPage]);

  useEffect(() => {
    setSelectedPosts([]);
  }, [currentPage]);

  useEffect(() => {
    const hasFilters = debouncedSearchQuery || selectedCategory || selectedTags.length > 0 || (effectiveIsAdmin && selectedStatus.length > 0);
    const needsPagination = currentPage > 1 || itemsPerPage !== initialPosts.length;

    if (hasFilters || needsPagination) {
      fetchPosts();
    } else {
      setPosts(initialPosts);
      setTotalPosts(initialTotal ?? initialPosts.length);
    }
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    selectedCategory,
    selectedTags,
    selectedStatus,
    effectiveIsAdmin,
    initialPosts,
    initialTotal,
    fetchPosts
  ]);

  const hasFilters = debouncedSearchQuery || selectedCategory || selectedTags.length > 0 || (effectiveIsAdmin && selectedStatus.length > 0);
  const needsPagination = currentPage > 1 || itemsPerPage !== initialPosts.length;
  const usedAPI = hasFilters || needsPagination;

  const paginatedPosts = usedAPI ? posts : posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPosts(selectedPosts.length === paginatedPosts.length ? [] : paginatedPosts.map(p => p.id));
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;

    setIsBulkDeleting(true);
    try {
      for (const postId of selectedPosts) {
        if (onDeletePost) {
          await onDeletePost(postId);
        }
      }
      setSelectedPosts([]);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const featuredPost = viewMode === 'grid' && paginatedPosts.length > 0
    ? paginatedPosts[0] as PostWithReadingTime
    : null;
  const remainingPosts = viewMode === 'grid' && paginatedPosts.length > 1
    ? paginatedPosts.slice(1)
    : viewMode === 'list' ? paginatedPosts : [];

  const formatFeaturedDate = (post: PostWithReadingTime) => {
    const date = post.published_at ? new Date(post.published_at) : new Date(post.created_at);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      <div className="section-panel p-5 sm:p-6 lg:p-8">
        <div className="mb-6">
          <div className="mb-5 flex flex-col gap-2 sm:mb-6">
            <p className="section-kicker">Editorial archive</p>
            <p className="section-lead max-w-2xl">
              Browse recent writing across technology, culture, leadership, and systems thinking with a calmer, more readable archive surface.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <BlogFilters
              categories={categories}
              tags={tags}
              onSearchChange={handleSearchChange}
              onCategoryChange={setSelectedCategory}
              onTagsChange={setSelectedTags}
              onStatusChange={setSelectedStatus}
              isAdmin={effectiveIsAdmin}
            />
            {!effectiveIsAdmin && (
              <div className="flex-shrink-0">
                <Button
                  onClick={() => setSubscriptionModalOpen(true)}
                  variant="primary"
                  size="md"
                  aria-label="Subscribe to updates"
                  className="shadow-md shadow-primary/25"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Subscribe
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-b border-border/40 pb-4 mb-8 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
                {isLoading ? 'Loading...' : `${totalPosts} post${totalPosts !== 1 ? 's' : ''}`}
              </div>
              {effectiveIsAdmin && paginatedPosts.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {selectedPosts.length === paginatedPosts.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selectedPosts.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50"
                    >
                      {isBulkDeleting ? 'Deleting...' : `Delete ${selectedPosts.length}`}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="inline-flex gap-1 rounded-xl border border-border/80 bg-muted/60 p-1.5 shadow-sm backdrop-blur-sm">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-lg transition-all h-8 w-8 p-0 flex items-center justify-center',
                  viewMode === 'grid'
                    ? 'bg-background shadow-sm'
                    : 'hover:bg-muted/80'
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-lg transition-all h-8 w-8 p-0 flex items-center justify-center',
                  viewMode === 'list'
                    ? 'bg-background shadow-sm'
                    : 'hover:bg-muted/80'
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          {isLoading ? (
            <BlogSkeleton viewMode={viewMode} count={itemsPerPage} />
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50/80 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/60 backdrop-blur-sm">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            </div>
          ) : paginatedPosts.length > 0 ? (
            <>
              {featuredPost && (
                <div className="relative mb-8">
                  {effectiveIsAdmin && (
                    <div className="absolute top-3 start-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(featuredPost.id)}
                        onChange={() => handleSelectPost(featuredPost.id)}
                        className="w-4 h-4 accent-primary bg-background border-input rounded"
                      />
                    </div>
                  )}
                  <div className="section-panel-muted grid grid-cols-1 gap-0 overflow-hidden md:grid-cols-2">
                    {featuredPost.cover_image ? (
                      <div className="relative aspect-[4/3] md:aspect-auto">
                        <Image
                          src={getSafeImageUrl(featuredPost.cover_image)}
                          fill
                          className="object-cover"
                          alt={featuredPost.title}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-[4/3] md:aspect-auto bg-muted/40" />
                    )}
                      <div className="flex flex-col justify-between bg-card/82 p-5 sm:p-8">
                      <div>
                        {featuredPost.category && (
                          <span className="text-xs font-mono font-semibold text-primary uppercase tracking-widest">
                            {featuredPost.category.name}
                          </span>
                        )}
                        <h3 className="text-2xl font-bold text-foreground mt-2 mb-3 leading-tight">
                          {featuredPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                          {featuredPost.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatFeaturedDate(featuredPost)}
                          {featuredPost.reading_time != null && ` · ${featuredPost.reading_time} min read`}
                        </span>
                        <a
                          href={`/blog/${featuredPost.slug}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          Read post <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(viewMode === 'list' || remainingPosts.length > 0) && (
                <div
                  className={cn(
                    'grid',
                    viewMode === 'grid'
                      ? 'gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
                      : 'gap-4 grid-cols-1'
                  )}
                >
                  {(viewMode === 'list' ? paginatedPosts : remainingPosts).map((post) => (
                    <div key={post.id} className="relative">
                      {effectiveIsAdmin && (
                        <div className="absolute top-2 start-2 z-10">
                          <input
                            type="checkbox"
                            checked={selectedPosts.includes(post.id)}
                            onChange={() => handleSelectPost(post.id)}
                            className="w-4 h-4 accent-primary bg-background border-input rounded"
                          />
                        </div>
                      )}
                      <PostCard
                        post={post}
                        viewMode={viewMode}
                        isAdmin={effectiveIsAdmin}
                        onEdit={onEditPost ? () => onEditPost(post.id) : undefined}
                        onDelete={onDeletePost ? () => onDeletePost(post.id) : undefined}
                        searchQuery={debouncedSearchQuery}
                        allTags={tags}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="col-span-full">
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-muted shadow-sm backdrop-blur-sm">
                  <Grid3X3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No posts found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                {effectiveIsAdmin && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => window.location.href = '/admin/posts/new'}
                    className="flex items-center gap-2 shadow-sm"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Create your first post
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {totalPosts > 0 && (
          <div className="border-t border-border/60 pt-6">
            <BlogPagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalPosts / itemsPerPage)}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />
    </div>
  );
}
