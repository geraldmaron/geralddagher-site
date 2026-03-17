'use client';
import { useState, useEffect, useCallback } from 'react';
import { Grid3X3, List, Mail } from 'lucide-react';
import Button from '@/components/core/Button';
import { cn } from '@/lib/utils';
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
export default function BlogWrapper({
  initialPosts,
  initialTotal,
  categories,
  tags,
  isAdmin,
  onEditPost,
  onDeletePost
}: BlogWrapperProps) {
  const { user } = useAuth();
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
      // Use Next.js API route instead of direct Directus client-side call (avoids CORS)
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

  const totalPages = Math.ceil(totalPosts / itemsPerPage);

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

  return (
    <div className="space-y-0">
      <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border/60 bg-gradient-to-r from-card/50 via-card/30 to-card/50">
          <BlogFilters
            categories={categories}
            tags={tags}
            onSearchChange={handleSearchChange}
            onCategoryChange={setSelectedCategory}
            onTagsChange={setSelectedTags}
            onStatusChange={setSelectedStatus}
            isAdmin={effectiveIsAdmin}
          />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-sm font-medium text-muted-foreground px-3 py-1.5 rounded-full bg-muted/80 border border-border/60">
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
            <div className="flex items-center space-x-3">
              {!effectiveIsAdmin && (
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
              )}
              <div className="inline-flex rounded-xl border border-border/80 bg-muted/60 backdrop-blur-sm p-1.5 gap-1 shadow-sm">
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
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
        <div
          className={cn(
            'grid',
            viewMode === 'grid'
              ? 'gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
              : 'gap-4 grid-cols-1'
          )}
        >
        {isLoading ? (
          <BlogSkeleton viewMode={viewMode} count={itemsPerPage} />
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50/80 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/60 backdrop-blur-sm">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          </div>
        ) : paginatedPosts.length > 0 ? (
          paginatedPosts.map((post) => {
            return (
              <div key={post.id} className="relative">
                {effectiveIsAdmin && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleSelectPost(post.id)}
                      className="w-4 h-4 accent-primary bg-background border-input rounded"
                    />
                  </div>
                )}
                <PostCard
                  key={post.id}
                  post={post}
                  viewMode={viewMode}
                  isAdmin={effectiveIsAdmin}
                  onEdit={onEditPost ? () => onEditPost(post.id) : undefined}
                  onDelete={onDeletePost ? () => onDeletePost(post.id) : undefined}
                  searchQuery={debouncedSearchQuery}
                  allTags={tags}
                />
              </div>
            );
          })
        ) : (
          <div className="col-span-full">
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted border border-border/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
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
        </div>
        {totalPosts > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 border-t border-border/60 pt-4 sm:pt-6 bg-gradient-to-r from-card/30 via-card/20 to-card/30">
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
