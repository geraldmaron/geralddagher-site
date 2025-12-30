'use client';
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme } from '@/components/core/ThemeProvider';
import { cn } from '@/lib/utils';
import type { TMPSubmission } from '@/lib/types/shared';
import { TMPSubmissionStatus } from '@/lib/types/database';
import { Play, ExternalLink, Calendar, ChevronLeft, ChevronRight, Grid3X3, List } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import type { TMPVideo } from '@/lib/types/tmp';

interface TMPYouTubeProps {
  className?: string;
  submissions: TMPSubmission[];
}

const VIDEOS_PER_PAGE = 9;

export default function TMPYouTube({ className, submissions }: TMPYouTubeProps) {
  const { isDarkMode } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  const getSessionDate = (submission: TMPSubmission): string => {
    const sessionDate = submission.session_date;
    if (sessionDate && typeof sessionDate === 'string' && sessionDate.trim()) {
      return sessionDate;
    }
    return submission.created_at;
  };

  const formatSessionDate = (dateString: string): string => {
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return format(date, 'MMM d, yyyy');
      }
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return '';
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return watchMatch[1];
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) return shortMatch[1];
    return null;
  };

  const videos: TMPVideo[] = submissions
    .filter(submission =>
      submission.status === TMPSubmissionStatus.Completed &&
      submission.youtube_link
    )
    .map(submission => {
      const youtubeId = extractYouTubeId(submission.youtube_link || '');
      if (!youtubeId) return null;
      return {
        id: String(submission.id),
        title: `${submission.first_name} ${submission.last_name}'s Story`,
        description: submission.about_you,
        youtube_id: youtubeId,
        thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
        published_at: getSessionDate(submission),
        created_at: submission.created_at,
        updated_at: submission.updated_at,
        channel_title: 'The Maron Project'
      };
    })
    .filter((video): video is NonNullable<typeof video> => video !== null)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const currentVideos = videos.slice(
    (currentPage - 1) * VIDEOS_PER_PAGE,
    currentPage * VIDEOS_PER_PAGE
  );

  const handleVideoClick = useCallback((youtubeId: string) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
  }, []);

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (videos.length === 0) {
    return (
      <section className={cn("py-12", className)}>
        <div className="flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
            <Play className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Stories Coming Soon</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-sm text-sm">
            The first inspiring stories are being crafted. Check back soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-8 sm:py-12", className)}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="px-4 sm:px-6 text-center mb-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300 mb-4">
            {videos.length} {videos.length === 1 ? 'Story' : 'Stories'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white tracking-tight">
            Watch Their{' '}
            <span className="font-semibold bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
              Stories
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-lg mx-auto">
            Real people sharing their transformation journeys
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-center px-4 sm:px-6">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                viewMode === 'grid'
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                viewMode === 'list'
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="px-4 sm:px-6">
          <div className={cn(
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-3"
          )}>
            <AnimatePresence mode="popLayout">
              {currentVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  onClick={() => handleVideoClick(video.youtube_id)}
                  onMouseEnter={() => setHoveredVideo(video.id)}
                  onMouseLeave={() => setHoveredVideo(null)}
                  className="group cursor-pointer"
                >
                  {viewMode === 'grid' ? (
                    <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:shadow-md">
                      <div className="aspect-video relative">
                        <Image
                          src={video.thumbnail_url}
                          alt={video.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                        <div className={cn(
                          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                          hoveredVideo === video.id ? "opacity-100" : "opacity-0"
                        )}>
                          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 text-slate-900 ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1.5">
                          <Calendar className="w-3 h-3" />
                          {formatSessionDate(video.published_at)}
                        </div>
                        <h4 className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {video.title}
                        </h4>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:shadow-md">
                      <div className="w-32 sm:w-40 flex-shrink-0 aspect-video relative rounded-lg overflow-hidden">
                        <Image
                          src={video.thumbnail_url}
                          alt={video.title}
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div className={cn(
                            "w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow transition-opacity",
                            hoveredVideo === video.id ? "opacity-100" : "opacity-0"
                          )}>
                            <Play className="w-3 h-3 text-slate-900 ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-white text-sm sm:text-base line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatSessionDate(video.published_at)}
                          </span>
                        </div>
                        {video.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-1.5 hidden sm:block">
                            {video.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 hidden sm:block">
                        <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                          <ExternalLink className="w-3 h-3" />
                          Watch
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {totalPages > 1 && (
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 px-4 sm:px-6 pt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-sm font-medium transition-all",
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
