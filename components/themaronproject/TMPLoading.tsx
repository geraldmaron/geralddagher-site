'use client';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useState } from 'react';
export const TMPLoading = () => {
  const prefersReducedMotion = useReducedMotion();
  const [error, setError] = useState(false);
  return (
    <div 
      className="h-screen flex items-center justify-center relative overflow-hidden w-full bg-white"
      role="status"
      aria-label="Loading content"
    >  
      <div className="flex flex-col max-w-5xl px-4 md:px-0">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative w-full aspect-video"
        >
          {!error ? (
            <video
              autoPlay
              muted
              playsInline
              className="rounded-lg w-full h-full object-contain"
              src="/TMPLoading.mp4"
              aria-hidden="true"
              onError={(e) => {
                setError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">Loading content...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
export default TMPLoading;