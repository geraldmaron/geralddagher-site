'use client';
import { cn } from '@/lib/utils';
interface BlogSkeletonProps {
  viewMode: 'grid' | 'list';
  count?: number;
}
export default function BlogSkeleton({ viewMode, count = 6 }: BlogSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'relative overflow-hidden rounded-2xl shadow-lg animate-pulse',
            viewMode === 'grid' 
              ? 'h-80 sm:h-96' 
              : 'h-64 sm:h-72'
          )}
        >
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/95" />
          
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-full flex-shrink-0" />
                <div className="min-w-0">
                  <div className="h-3 bg-white/30 rounded w-20 mb-1" />
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 bg-white/20 rounded w-12" />
                    <div className="h-2.5 bg-white/20 rounded w-8" />
                  </div>
                </div>
              </div>
              <div className="h-6 bg-white/20 rounded-full w-16" />
            </div>

            <div className="space-y-3">
              <div>
                <div className="h-5 bg-white/30 rounded w-4/5 mb-2" />
                {viewMode === 'list' && (
                  <div className="h-5 bg-white/30 rounded w-3/5 mb-2" />
                )}
                <div className="h-3 bg-white/20 rounded w-full" />
                {viewMode === 'list' && (
                  <div className="h-3 bg-white/20 rounded w-5/6" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <div className="h-5 bg-white/20 rounded-full w-12" />
                <div className="h-5 bg-white/20 rounded-full w-10" />
                <div className="h-5 bg-white/20 rounded-full w-8" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-3 bg-white/20 rounded w-8" />
                  <div className="h-3 bg-white/20 rounded w-12" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 bg-white/20 rounded w-8" />
                  <div className="h-3 w-3 bg-white/20 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
} 