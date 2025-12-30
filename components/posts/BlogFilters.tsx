'use client';
import { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import { cn } from '@/lib/utils';
import { zIndex } from '@/lib/utils/z-index';
import { PostStatus } from '@/lib/types/database';
import type { Category, Tag } from '@/lib/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/core/Button';
import { useDebounce } from '@/hooks/useDebounce';
interface BlogFiltersProps {
  categories: Category[];
  tags: Tag[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onTagsChange: (tagIds: string[]) => void;
  onStatusChange?: (status: PostStatus[]) => void;
  isAdmin?: boolean;
}
export default function BlogFilters({
  categories,
  tags,
  onSearchChange,
  onCategoryChange,
  onTagsChange,
  onStatusChange,
  isAdmin = false
}: BlogFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<PostStatus[]>([]);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  useEffect(() => {
    if (debouncedSearchQuery.length > 0 && debouncedSearchQuery.length < 2) {
      setFilterError('Search query must be at least 2 characters long');
      return;
    }
    setFilterError(null);
    onSearchChange(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearchChange]);
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setFilterError(null);
    onCategoryChange(value === 'all' ? '' : value);
  };
  const handleTagChange = (tagId: string) => {
    const MAX_TAGS = 5;
    if (selectedTags.length >= MAX_TAGS && !selectedTags.includes(tagId)) {
      setFilterError(`You can select up to ${MAX_TAGS} tags at a time`);
      return;
    }
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newTags);
    setFilterError(null);
    onTagsChange(newTags);
  };
  const handleStatusChange = (status: PostStatus) => {
    const MAX_STATUSES = 2;
    if (selectedStatus.length >= MAX_STATUSES && !selectedStatus.includes(status)) {
      setFilterError(`You can select up to ${MAX_STATUSES} statuses at a time`);
      return;
    }
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    setSelectedStatus(newStatus);
    setFilterError(null);
    onStatusChange?.(newStatus);
  };
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTags([]);
    setSelectedStatus([]);
    setFilterError(null);
    onSearchChange('');
    onCategoryChange('all');
    onTagsChange([]);
    onStatusChange?.([]);
  };
  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedTags.length > 0 || selectedStatus.length > 0;
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="search"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-3 h-10 py-2 border border-gray-200/80 dark:border-gray-700/80 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-sm shadow-sm",
              filterError && "border-red-500/80 dark:border-red-500/80",
              "focus:ring-2 focus:ring-blue-500/20"
            )}
            aria-invalid={!!filterError}
            aria-describedby={filterError ? "search-error" : undefined}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "transition-all duration-200 whitespace-nowrap",
              hasActiveFilters && "bg-background border-input text-foreground"
            )}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Filters</span>
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="md"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
      {filterError && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          id="search-error"
          className="text-sm text-destructive"
        >
          {filterError}
        </motion.p>
      )}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={false}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden relative"
            style={{ zIndex: zIndex.filterDropdown }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "cursor-pointer transition-all duration-200 px-3 py-1.5 rounded-full text-sm whitespace-nowrap",
                    selectedCategory === 'all' 
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                  )}
                  onClick={() => handleCategoryChange('all')}
                >
                  All Categories
                  {selectedCategory === 'all' && (
                    <X className="ml-1 h-3 w-3 inline" />
                  )}
                </span>
                {categories.map((category) => (
                  <span
                    key={category.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 px-3 py-1.5 rounded-full text-sm whitespace-nowrap",
                      selectedCategory === category.id 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                    )}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                    {selectedCategory === category.id && (
                      <X className="ml-1 h-3 w-3 inline" />
                    )}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 px-3 py-1.5 rounded-full text-sm whitespace-nowrap",
                      selectedTags.includes(tag.id) 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600",
                      selectedTags.length >= 5 && !selectedTags.includes(tag.id) && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleTagChange(tag.id)}
                  >
                    {tag.name}
                    {selectedTags.includes(tag.id) && (
                      <X className="ml-1 h-3 w-3 inline" />
                    )}
                  </span>
                ))}
              </div>
            </div>
            {isAdmin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(PostStatus).map((status) => (
                    <span
                      key={status}
                      className={cn(
                        "cursor-pointer transition-all duration-200 px-3 py-1.5 rounded-full text-sm whitespace-nowrap",
                        selectedStatus.includes(status) 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600",
                        selectedStatus.length >= 2 && !selectedStatus.includes(status) && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => handleStatusChange(status)}
                    >
                      {status}
                      {selectedStatus.includes(status) && (
                        <X className="ml-1 h-3 w-3 inline" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}