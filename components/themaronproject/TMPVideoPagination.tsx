'use client';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface TMPVideoPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
const TMPVideoPagination: React.FC<TMPVideoPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const prefersReducedMotion = useReducedMotion();
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  return (
    <div className="flex justify-center items-center space-x-4 mt-8" role="navigation" aria-label="Video pagination">
      <motion.button
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg ${
          currentPage === 1
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-purple-500 hover:bg-purple-600'
        } text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
        aria-label="Previous page"
        aria-disabled={currentPage === 1}
      >
        Previous
      </motion.button>
      <span className="font-medium" aria-current="page">
        Page {currentPage} of {totalPages}
      </span>
      <motion.button
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg ${
          currentPage === totalPages
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-purple-500 hover:bg-purple-600'
        } text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
        aria-label="Next page"
        aria-disabled={currentPage === totalPages}
      >
        Next
      </motion.button>
    </div>
  );
};
export default TMPVideoPagination;