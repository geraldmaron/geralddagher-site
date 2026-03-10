'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface PolaroidProps {
  src: string;
  alt: string;
  rotation: number;
  delay?: number;
}

const Polaroid: React.FC<PolaroidProps> = ({ src, alt, rotation, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, rotate: rotation }}
    animate={{ opacity: 1, y: 0, rotate: rotation }}
    transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    whileHover={{ rotate: 0, scale: 1.05, zIndex: 10 }}
    className="relative shrink-0 cursor-pointer"
  >
    <div className="rounded-sm bg-white p-2 pb-8 shadow-lg shadow-black/10 dark:bg-gray-100 dark:shadow-black/30">
      <div className="relative h-32 w-32 overflow-hidden sm:h-40 sm:w-40">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 128px, 160px"
        />
      </div>
    </div>
  </motion.div>
);

const photos: PolaroidProps[] = [
  { src: '/polaroids/Family.jpg', alt: 'Family', rotation: -4 },
  { src: '/polaroids/MomAndI.jpg', alt: 'Mom and I', rotation: 3 },
  { src: '/polaroids/WeddingBelt.jpg', alt: 'Wedding', rotation: -2 },
  { src: '/polaroids/BabyG.jpg', alt: 'Baby G', rotation: 5 },
  { src: '/polaroids/reInvent.jpg', alt: 'reInvent', rotation: -3 },
];

const PolaroidGallery: React.FC = () => (
  <div className="relative -mx-4 sm:-mx-6">
    <div className="flex items-center justify-center gap-4 overflow-x-auto px-4 py-4 sm:gap-6 sm:px-6 no-scrollbar">
      {photos.map((photo, i) => (
        <Polaroid
          key={photo.src}
          {...photo}
          delay={i * 0.1}
        />
      ))}
    </div>
    {/* Fade edges */}
    <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
    <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
  </div>
);

export default React.memo(PolaroidGallery);
