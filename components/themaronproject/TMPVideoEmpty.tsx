'use client';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

const TMPVideoEmpty = () => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center"
      role="status"
      aria-label="No videos available"
    >
      <motion.div
        initial={prefersReducedMotion ? { scale: 1 } : { scale: 0.8 }}
        animate={{ scale: 1 }}
        className="mb-6 text-gray-400"
      >
        <svg
          className="w-16 h-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </motion.div>
      <h2 className="mb-2 text-lg font-semibold">No Videos Available</h2>
      <p className="text-gray-600">
        We couldn&apos;t find any videos matching your criteria. Please try adjusting your search or check back later.
      </p>
    </motion.div>
  );
};
export default TMPVideoEmpty;