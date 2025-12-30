import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

import Button from '@/components/core/Button';
import Image from 'next/image';
interface ImageSearchProps {
  onSelect: (imageUrl: string) => void;
}
export default function ImageSearch({ onSelect }: ImageSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [lastQuery, setLastQuery] = useState('');

  const searchImages = async (page: number = 1) => {
    const trimmedQuery = searchTerm.trim();
    if (!trimmedQuery) return;
    
    const validPage = Math.max(1, Math.floor(page || 1));
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/unsplash/search?query=${encodeURIComponent(trimmedQuery)}&page=${validPage}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || 'Failed to fetch images');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.query && data.query !== trimmedQuery) {
        console.warn('Query mismatch:', { searched: trimmedQuery, returned: data.query });
      }
      
      setImages(data.results || []);
      setTotalPages(data.total_pages || 0);
      setTotalResults(data.total || 0);
      setCurrentPage(data.current_page || validPage);
      setLastQuery(trimmedQuery);
    } catch (err: any) {
      setError(err.message || 'Failed to search images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && !isLoading) {
      searchImages(newPage);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search for images..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
            if (e.target.value.trim() !== lastQuery) {
              setCurrentPage(1);
            }
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              setCurrentPage(1);
              searchImages(1);
            }
          }}
          className="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-neutral-400 dark:placeholder-neutral-500"
        />
        <Button onClick={() => searchImages(1)} disabled={isLoading || !searchTerm.trim()}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {lastQuery && totalResults > 0 && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Found {totalResults} results for "{lastQuery}"
        </p>
      )}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : images.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => onSelect(image.urls.regular)}
                className="relative aspect-video rounded-lg overflow-hidden hover:ring-2 ring-primary transition-all"
              >
                <Image
                  src={image.urls.thumb}
                  alt={image.alt_description || 'Unsplash image'}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : lastQuery && !isLoading ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center py-4">
          No images found. Try a different search term.
        </p>
      ) : null}
    </div>
  );
}