'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, MoreHorizontal, ArrowRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import Button from '@/components/core/Button';
import { cn } from '@/lib/utils';
import { getPlainTextFromSlate, calculateReadingTime } from '@/lib/utils/readingTime';
import { getSafeImageUrl } from '@/lib/utils/imageUtils';
import type { PostData } from '@/lib/types/shared';
import type { Tag } from '@/lib/types/database';
import { PostStatus } from '@/lib/types/database';
import { useRouter } from 'next/navigation';
import SlateRenderer from '@/components/core/SlateRenderer';

interface PostCardProps {
  post: PostData & { reading_time?: number };
  viewMode: 'grid' | 'list';
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  searchQuery?: string;
  allTags?: Tag[];
  forcePreview?: boolean;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightText = (text: string, query: string): React.JSX.Element => {
  if (!query.trim()) return <span>{text}</span>;
  const safeQuery = escapeRegExp(query.trim());
  const regex = new RegExp(`(${safeQuery})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark
            key={`${part}-${index}`}
            className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 px-0.5 rounded font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </span>
  );
};

const extractFullTextFromSlate = (content: any): string => {
  if (!content) return '';
  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (Array.isArray(content)) {
    text = content.map((node: any) => {
      if (typeof node === 'string') return node;
      let nodeText = '';
      if ('text' in node) {
        nodeText += node.text;
      }
      if ('children' in node && Array.isArray(node.children)) {
        nodeText += ' ' + node.children.map((child: any) => {
          if (typeof child === 'string') return child;
          if ('text' in child) return child.text;
          return '';
        }).join(' ');
      }
      return nodeText;
    }).join(' ').replace(/\s+/g, ' ').trim();
  } else if (content.type === 'slate' && Array.isArray(content.content)) {
    text = content.content.map((node: any) => {
      if (typeof node === 'string') return node;
      let nodeText = '';
      if ('text' in node) {
        nodeText += node.text;
      }
      if ('children' in node && Array.isArray(node.children)) {
        nodeText += ' ' + node.children.map((child: any) => {
          if (typeof child === 'string') return child;
          if ('text' in child) return child.text;
          return '';
        }).join(' ');
      }
      return nodeText;
    }).join(' ').replace(/\s+/g, ' ').trim();
  } else {
    text = JSON.stringify(content);
  }
  return text;
};

const parseContentValue = (content: any) => {
  if (typeof content === 'string') {
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return content;
      }
    }
  }
  return content;
};

const getSearchHighlightedText = (content: any, searchQuery: string, maxLength: number = 200): React.JSX.Element => {
  if (!searchQuery.trim()) {
    return <span>{getPlainTextFromSlate(content, maxLength)}</span>;
  }

  const plainText = extractFullTextFromSlate(content);
  const lowerQuery = searchQuery.trim().toLowerCase();
  const lowerText = plainText.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return <span>{getPlainTextFromSlate(content, maxLength)}</span>;
  }

  const contextLength = Math.floor(maxLength / 2);
  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(plainText.length, matchIndex + lowerQuery.length + contextLength);
  let excerpt = plainText.slice(start, end);

  if (start > 0) excerpt = '...' + excerpt;
  if (end < plainText.length) excerpt = excerpt + '...';

  return highlightText(excerpt, searchQuery);
};

const getStatusConfig = (status: PostStatus) => {
  switch (status) {
    case PostStatus.Published:
      return {
        color: 'bg-emerald-500',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        label: 'Published'
      };
    case PostStatus.Draft:
      return {
        color: 'bg-amber-500',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        textColor: 'text-amber-700 dark:text-amber-300',
        label: 'Draft'
      };
    case PostStatus.Archived:
      return {
        color: 'bg-gray-500',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        textColor: 'text-gray-700 dark:text-gray-300',
        label: 'Archived'
      };
    default:
      return {
        color: 'bg-gray-500',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        textColor: 'text-gray-700 dark:text-gray-300',
        label: 'Unknown'
      };
  }
};

export default function PostCard({
  post,
  viewMode,
  isAdmin = false,
  onEdit,
  onDelete,
  searchQuery = '',
  allTags = [],
  forcePreview = false
}: PostCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const router = useRouter();
  const normalizedContent = useMemo(() => parseContentValue(post.content), [post.content]);
  const plainTextContent = useMemo(() => extractFullTextFromSlate(normalizedContent), [normalizedContent]);
  const readingTime = useMemo(() => {
    if (typeof post.reading_time === 'number' && post.reading_time > 0) return post.reading_time;
    return calculateReadingTime(normalizedContent);
  }, [normalizedContent, post.reading_time]);

  const tagNames = useMemo(() => {
    if (!post.tags) return [] as (string | number)[];
    const tagLookup = allTags || [];
    return post.tags.map((tagItem: any) => {
      const candidateId = typeof tagItem === 'object' ? (tagItem.name ? tagItem.id ?? tagItem.name : tagItem.tags_id?.id ?? tagItem.id) : tagItem;
      const candidateName = typeof tagItem === 'object'
        ? (tagItem.name || tagItem.tags_id?.name || String(candidateId))
        : undefined;

      const match = tagLookup.find(t => String(t.id) === String(candidateId));
      return candidateName || match?.name || String(candidateId);
    });
  }, [post.tags, allTags]);

  const categoryName = useMemo(() => {
    const cat: any = (post as any).category;
    if (!cat) return null;
    if (typeof cat === 'object') return cat.name || cat.title || null;
    return cat;
  }, [post]);

  const authorName = useMemo(() => {
    const a: any = (post as any).author;
    if (!a) return null;
    const first = a.first_name || a.firstName;
    const last = a.last_name || a.lastName;
    const full = [first, last].filter(Boolean).join(' ');
    return full || a.name || null;
  }, [post]);

  const publishedDate = post.published_at ? new Date(post.published_at) : null;
  const createdDate = new Date(post.created_at);
  const displayDate = publishedDate || createdDate;

  const formattedDate = displayDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const previewContent = useMemo(() => {
    try {
      if (Array.isArray(normalizedContent)) return normalizedContent.slice(0, 3);
      if (typeof normalizedContent === 'object' && normalizedContent?.content && Array.isArray(normalizedContent.content)) {
        return normalizedContent.content.slice(0, 3);
      }
    } catch {/* fall back */}
    return normalizedContent;
  }, [normalizedContent]);

  const displayText = useMemo(() => {
    if (searchQuery.trim()) {
      return getSearchHighlightedText(normalizedContent, searchQuery, viewMode === 'list' ? 200 : 120);
    }
    const fallbackText = plainTextContent || getPlainTextFromSlate(normalizedContent, viewMode === 'list' ? 200 : 120);
    if (viewMode === 'list') {
      return post.excerpt || fallbackText;
    }
    return post.excerpt || (fallbackText.length > 120 ? `${fallbackText.slice(0, 117).trim()}…` : fallbackText);
  }, [normalizedContent, plainTextContent, post.excerpt, searchQuery, viewMode]);

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete();
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setIsDeleting(false);
      }
    }
    setIsDeleteDialogOpen(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/admin/posts/${post.slug}`);
  };

  const imageUrl = getSafeImageUrl(post.cover_image);

  const postLink = forcePreview ? `/blog/preview/${post.slug}` : post.status === PostStatus.Published ? `/blog/${post.slug}` : `/blog/preview/${post.slug}`;
  const statusConfig = getStatusConfig(post.status);

  if (viewMode === 'list') {
    return (
      <>
        <Link
          href={postLink}
          className="group block h-full focus:outline-none"
          role="article"
          aria-labelledby={`post-title-${post.id}`}
        >
          <article className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200/80 dark:border-neutral-800/80 hover:border-gray-300 dark:hover:border-neutral-700 transition-all duration-200 h-full flex shadow-sm hover:shadow-lg">
            <div className="relative w-40 sm:w-48 flex-shrink-0 bg-gray-100 dark:bg-neutral-800">
              <Image
                src={imageUrl}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 160px, 192px"
                className={cn(
                  'object-cover transition-opacity duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
              />

              {post.status !== PostStatus.Published && (
                <div className="absolute top-2 left-2">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border",
                    statusConfig.bgColor,
                    statusConfig.textColor,
                    "border-transparent"
                  )}>
                    {statusConfig.label}
                  </span>
                </div>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                  <time dateTime={displayDate.toISOString()}>{formattedDate}</time>
                  <span>•</span>
                  <span>{readingTime} min read</span>
                  {categoryName && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 text-[11px] font-medium border border-blue-200/70 dark:border-blue-800/70">
                      {categoryName}
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <div className="relative flex-shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAdminMenu(!showAdminMenu);
                      }}
                      className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showAdminMenu && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-800 py-1 z-50">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowAdminMenu(false);
                            if (onEdit) onEdit();
                            else handleEdit(e);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center gap-2"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowAdminMenu(false);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <h2
                id={`post-title-${post.id}`}
                className="text-base font-semibold text-gray-900 dark:text-white leading-tight line-clamp-1 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              >
                {searchQuery ? highlightText(post.title, searchQuery) : post.title}
              </h2>

              <div className="relative mb-3">
                {searchQuery.trim() ? (
                  <div className="prose prose-sm prose-gray dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
                    {displayText}
                  </div>
                ) : (
                  <div className="prose prose-sm prose-gray dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {post.excerpt ? (
                      <p className="line-clamp-2">{post.excerpt}</p>
                    ) : (
                      <div className="max-h-20 overflow-hidden">
                        <SlateRenderer content={previewContent as any} compact className="[&_p]:mb-2 [&_p]:text-sm [&_ul]:my-1 [&_ol]:my-1" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800 mt-auto">
                <div className="flex min-w-0 items-center gap-2 overflow-hidden flex-nowrap h-8">
                  {authorName && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 shrink-0">
                      {authorName}
                    </span>
                  )}
                  {tagNames.slice(0, 2).map((tagName, index) => (
                    <span
                      key={`${tagName}-${index}`}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 shrink-0"
                    >
                      {tagName}
                    </span>
                  ))}
                  {tagNames.length > 2 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                      +{tagNames.length - 2}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white group-hover:gap-2 transition-all">
                  <span>Read</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </article>
        </Link>

        <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm transition-opacity" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-xl border border-gray-200 dark:border-neutral-800 w-full max-w-sm">
              <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Delete Post
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{post.title}"? This action cannot be undone.
              </Dialog.Description>
              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  color="red"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </>
    );
  }

  return (
    <>
      <Link
        href={postLink}
        className="group block h-full focus:outline-none"
        role="article"
        aria-labelledby={`post-title-${post.id}`}
      >
        <article className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200/80 dark:border-neutral-800/80 hover:border-gray-300 dark:hover:border-neutral-700 transition-all duration-200 h-full flex flex-col shadow-sm hover:shadow-lg">
          <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-neutral-800">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={cn(
                'object-cover transition-transform duration-500 group-hover:scale-105',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
            />

            {!forcePreview && post.status !== PostStatus.Published && (
              <div className="absolute top-3 left-3">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm shadow-sm",
                  statusConfig.bgColor,
                  statusConfig.textColor
                )}>
                  {statusConfig.label}
                </span>
              </div>
            )}

            {isAdmin && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onEdit) onEdit();
                    else handleEdit(e);
                  }}
                  className="p-2 rounded-lg bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                  className="p-2 rounded-lg bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 shadow-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
              <time dateTime={displayDate.toISOString()}>{formattedDate}</time>
              <span>•</span>
              <span>{readingTime} min read</span>
              {categoryName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 text-[11px] font-medium border border-blue-200/70 dark:border-blue-800/70">
                  {categoryName}
                </span>
              )}
            </div>

            <h2
              id={`post-title-${post.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              {searchQuery ? highlightText(post.title, searchQuery) : post.title}
            </h2>

            <div className="relative mb-4">
              {searchQuery.trim() ? (
                <div className="prose prose-sm prose-gray dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                  {displayText}
                </div>
              ) : (
                <div className="prose prose-sm prose-gray dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {post.excerpt ? (
                    <p className="line-clamp-3">{post.excerpt}</p>
                  ) : (
                    <div className="max-h-24 overflow-hidden">
                      <SlateRenderer content={previewContent as any} compact className="[&_p]:mb-2 [&_p]:text-sm [&_ul]:my-1 [&_ol]:my-1" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800 mt-auto">
              <div className="flex min-w-0 items-center gap-2 overflow-hidden flex-nowrap h-8">
                {authorName && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 shrink-0">
                    {authorName}
                  </span>
                )}
                {tagNames.slice(0, 2).map((tagName, index) => (
                  <span
                    key={`${tagName}-${index}`}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 shrink-0"
                  >
                    {tagName}
                  </span>
                ))}
                {tagNames.length > 2 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    +{tagNames.length - 2}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white group-hover:gap-2 transition-all">
                <span>Read</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </article>
      </Link>

      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm transition-opacity" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-xl border border-gray-200 dark:border-neutral-800 w-full max-w-sm">
            <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Delete Post
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{post.title}"? This action cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                color="red"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
} 