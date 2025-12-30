'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Search, X, Loader2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/core/Button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Asset {
  key: string;
  url: string;
  size: number;
  lastModified: string;
}

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    username: string;
  };
}

interface CoverImagePickerProps {
  value: string | null;
  onChange: (url: string | null) => void;
  onError?: (error: string) => void;
}

type Tab = 'upload' | 'library' | 'unsplash';

export function CoverImagePicker({ value, onChange, onError }: CoverImagePickerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [unsplashPage, setUnsplashPage] = useState(1);
  const [unsplashTotalPages, setUnsplashTotalPages] = useState(0);
  const [unsplashTotalResults, setUnsplashTotalResults] = useState(0);
  const [lastUnsplashQuery, setLastUnsplashQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAssets = useCallback(async () => {
    setLoadingAssets(true);
    try {
      const response = await fetch('/api/admin/assets');
      const data = await response.json();
      setAssets(data.data || []);
    } catch (error) {
      onError?.('Failed to load asset library');
    } finally {
      setLoadingAssets(false);
    }
  }, [onError]);

  const handleUnsplashSelect = useCallback(async (image: UnsplashImage) => {
    setIsUploading(true);
    try {
      const response = await fetch('/api/admin/assets/from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: image.urls.regular,
          filename: image.alt_description || image.id
        })
      });

      const data = await response.json();

      if (data.error) {
        onError?.(data.error);
        return;
      }

      onChange(data.data.url);
    } catch (error: any) {
      onError?.('Failed to upload Unsplash image to storage');
    } finally {
      setIsUploading(false);
    }
  }, [onChange, onError]);

  const searchUnsplash = useCallback(async (page: number = 1) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    const validPage = Math.max(1, Math.floor(page || 1));

    setSearching(true);
    try {
      const response = await fetch(
        `/api/unsplash/search?query=${encodeURIComponent(trimmedQuery)}&page=${validPage}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        onError?.(errorData.error || `Failed to search Unsplash: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.error) {
        onError?.(data.error);
        return;
      }

      if (data.query && data.query !== trimmedQuery) {
        console.warn('Query mismatch:', { searched: trimmedQuery, returned: data.query });
      }

      setUnsplashImages(data.results || []);
      setUnsplashTotalPages(data.total_pages || 0);
      setUnsplashTotalResults(data.total || 0);
      setUnsplashPage(data.current_page || validPage);
      setLastUnsplashQuery(trimmedQuery);
    } catch (error: any) {
      onError?.(error.message || 'Failed to search Unsplash');
    } finally {
      setSearching(false);
    }
  }, [searchQuery, onError]);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/assets', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.error) {
        onError?.(data.error);
        return;
      }

      onChange(data.data.url);
    } catch (error) {
      onError?.('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const tabs = [
    { id: 'upload' as Tab, label: 'Upload', icon: Upload },
    { id: 'library' as Tab, label: 'Library', icon: ImageIcon },
    { id: 'unsplash' as Tab, label: 'Unsplash', icon: Search },
  ];

  // Helper function to check if a string is a valid URL
  const isValidUrl = (url: string | null): boolean => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return false;
    }
    try {
      new URL(url);
      return true;
    } catch {
      // Check if it's a relative path starting with /
      return url.startsWith('/');
    }
  };

  return (
    <div className="space-y-4">
      {value && isValidUrl(value) && (
        <div className="relative group">
          <div className="relative w-full aspect-[21/9] bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
            <Image
              src={value}
              alt="Cover image"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <Button
            onClick={() => onChange(null)}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'library' && assets.length === 0) {
                  loadAssets();
                }
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative',
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
              )}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                  <p className="text-sm font-medium mb-2 text-neutral-900 dark:text-neutral-100">
                    Drop an image here or click to browse
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    Supports: JPG, PNG, GIF, WEBP
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {loadingAssets ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">No images in library</p>
                <Button onClick={loadAssets} variant="outline" className="mt-4">
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {assets.filter((asset) => isValidUrl(asset.url)).map((asset) => (
                  <button
                    key={asset.key}
                    onClick={() => onChange(asset.url)}
                    className={cn(
                      'relative aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden group',
                      value === asset.url && 'ring-2 ring-blue-600'
                    )}
                  >
                    <Image
                      src={asset.url}
                      alt={asset.key}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover"
                    />
                    {value === asset.url && (
                      <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <Check className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'unsplash' && (
          <motion.div
            key="unsplash"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() !== lastUnsplashQuery) {
                    setUnsplashPage(1);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setUnsplashPage(1);
                    searchUnsplash(1);
                  }
                }}
                placeholder="Search Unsplash..."
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Button onClick={() => searchUnsplash(1)} disabled={searching || !searchQuery.trim()}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {lastUnsplashQuery && unsplashTotalResults > 0 && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Found {unsplashTotalResults} results for "{lastUnsplashQuery}"
              </p>
            )}

            {unsplashImages.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {unsplashImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => handleUnsplashSelect(image)}
                      disabled={isUploading}
                      className={cn(
                        'relative aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden group',
                        value?.includes(image.id) && 'ring-2 ring-blue-600',
                        isUploading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Image
                        src={image.urls.small}
                        alt={image.alt_description || 'Unsplash image'}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover"
                      />
                      {value?.includes(image.id) && (
                        <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                          <Check className="h-8 w-8 text-white" />
                        </div>
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white truncate">by {image.user.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {unsplashTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <Button
                      onClick={() => {
                        const newPage = unsplashPage - 1;
                        setUnsplashPage(newPage);
                        searchUnsplash(newPage);
                      }}
                      disabled={unsplashPage <= 1 || searching}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Page {unsplashPage} of {unsplashTotalPages}
                    </span>
                    <Button
                      onClick={() => {
                        const newPage = unsplashPage + 1;
                        setUnsplashPage(newPage);
                        searchUnsplash(newPage);
                      }}
                      disabled={unsplashPage >= unsplashTotalPages || searching}
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : lastUnsplashQuery && !searching ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  No images found. Try a different search term.
                </p>
              </div>
            ) : !lastUnsplashQuery ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Search for beautiful free images from Unsplash
                </p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
