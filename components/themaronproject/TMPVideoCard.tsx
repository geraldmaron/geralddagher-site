'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/core/ThemeProvider';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useReducedMotion } from 'framer-motion';
import { Play, Clock, Eye, ExternalLink } from 'lucide-react';
import Button from '@/components/core/Button';
import type { TMPVideo } from '@/lib/types/tmp';

interface TMPVideoCardProps {
  video: TMPVideo;
  viewMode: 'grid' | 'list';
  isDarkMode: boolean;
  onSelect: () => void;
  isActive: boolean;
}

export default function TMPVideoCard({ video, viewMode, isDarkMode, onSelect, isActive }: TMPVideoCardProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const cardVariants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={prefersReducedMotion ? {} : { y: -2 }}
        onClick={onSelect}
        className={cn(
          'group relative overflow-hidden cursor-pointer transition-all duration-300 border',
          'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm',
          'border-gray-200/60 dark:border-gray-800/60',
          'hover:border-gray-300/80 dark:hover:border-gray-700/80',
          'shadow-sm hover:shadow-lg dark:shadow-gray-900/20',
          'rounded-2xl min-h-[120px] sm:min-h-[140px] w-full',
          'max-w-full',
          isActive && 'ring-2 ring-blue-500/60 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900'
        )}
        role="button"
        tabIndex={0}
        aria-label={`Play video: ${video.title}`}
      >
        <div className="p-3 sm:p-4 md:p-6 overflow-hidden h-full flex flex-col justify-between min-h-0 relative">
          <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4 flex-1 min-h-0 relative">
            <div className={cn(
              'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center',
              'transition-all duration-300 group-hover:scale-105',
              'bg-gradient-to-br from-blue-500/10 to-purple-500/10',
              'dark:from-blue-400/20 dark:to-purple-400/20',
              'border border-blue-200/30 dark:border-blue-700/30',
              'group-hover:border-blue-300/50 dark:group-hover:border-blue-600/50',
              'relative z-10'
            )}>
              <Play 
                size={16} 
                className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" 
              />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden relative z-10">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 leading-tight line-clamp-2 break-words text-xs sm:text-sm md:text-base lg:text-lg">
                {video.title}
              </h3>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-auto relative z-10">
            <div className="flex-1 min-w-0 overflow-hidden relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink-0">
                  <Clock size={14} className="flex-shrink-0" />
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-none">{formatDate(video.published_at)}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink-0">
                  <Eye size={14} className="flex-shrink-0" />
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sm:max-w-none">YouTube Video</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto relative z-10">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 min-h-[32px] sm:min-h-[36px] md:min-h-[40px]"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                <ExternalLink size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">Watch Story</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        'relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300',
        'aspect-video w-full',
        'bg-white dark:bg-gray-900',
        'shadow-lg hover:shadow-xl dark:shadow-gray-900/30',
        'border border-gray-200/60 dark:border-gray-800/60',
        'hover:border-gray-300/80 dark:hover:border-gray-700/80',
        isActive && 'ring-2 ring-blue-500/60 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900'
      )}
      role="button"
      tabIndex={0}
      aria-label={`Play video: ${video.title}`}
    >
      <div className="relative w-full h-full">
        <Image
          src={video.thumbnail_url}
          alt={`Thumbnail for ${video.title}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-20 h-20 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <Play size={32} className="text-blue-600 dark:text-blue-400 ml-1" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <h3 className="font-semibold line-clamp-2 text-white leading-tight text-sm sm:text-base lg:text-lg">
          {video.title}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3 text-gray-200">
            <Clock size={16} />
            <span>{formatDate(video.published_at)}</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="px-2 py-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <ExternalLink size={12} className="mr-1" />
            Watch
          </Button>
        </div>
      </div>
    </motion.div>
  );
}