'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import TMPVideoCard from './TMPVideoCard';
import TMPVideoPlayer from './TMPVideoPlayer';
import type { TMPVideo } from '@/lib/types/tmp';

interface TMPVideoGridProps {
  videos: TMPVideo[];
  viewMode: 'grid' | 'list';
  activeVideo: string | null;
  onVideoSelect: (videoId: string | null) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const TMPVideoGrid: React.FC<TMPVideoGridProps> = ({
  videos,
  viewMode,
  activeVideo,
  onVideoSelect
}) => {
  const handleVideoSelect = (videoId: string) => {
    onVideoSelect(videoId);
  };

  return (
    <div
      role="region"
      aria-label="Video gallery"
      className="space-y-8"
    >
      {activeVideo && (
        <TMPVideoPlayer
          videoId={activeVideo}
          onClose={() => onVideoSelect(null)}
        />
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          'grid gap-6',
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        )}
      >
        {videos.map((video) => (
          <TMPVideoCard
            key={video.id}
            video={video}
            viewMode={viewMode}
            isActive={video.youtube_id === activeVideo}
            onSelect={() => handleVideoSelect(video.youtube_id)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default TMPVideoGrid;
