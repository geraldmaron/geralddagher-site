import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { useTheme } from '@/components/core/ThemeProvider';
import { useMediaQuery } from 'usehooks-ts';
interface MeetingInviteProps {
  isOpen: boolean;
  onRequestClose: () => void;
}
const MeetingInvite: React.FC<MeetingInviteProps> = ({ isOpen, onRequestClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, duration: 0.5 }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onRequestClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onRequestClose]);
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          variants={overlayVariants}
          onClick={onRequestClose}
          aria-hidden="true"
        />
        <motion.div
          className={`
            relative w-full max-w-4xl rounded-2xl 
            ${isDarkMode ? 'bg-gray-900' : 'bg-white'}
            ${isMobile ? 'h-[90vh] mx-4' : 'h-[80vh] mx-8'}
            overflow-hidden shadow-2xl
          `}
          variants={modalVariants}
          role="dialog"
          aria-modal="true"
          aria-labelledby="meeting-modal-title"
          aria-describedby="meeting-modal-description"
        >
          <div className="sticky top-0 z-50 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-inherit">
            <div className="flex items-center space-x-3">
              <Calendar 
                className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} 
                size={24} 
                aria-hidden="true"
              />
              <h2 
                id="meeting-modal-title"
                className="font-semibold"
              >
                Schedule Time to Chat
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRequestClose}
              className={`
                p-2 rounded-full transition-colors
                ${isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}
              `}
              aria-label="Close modal"
            >
              <X size={20} aria-hidden="true" />
            </motion.button>
          </div>
          <div className="relative h-full">
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                  role="status"
                  aria-label="Loading calendar"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div 
                      className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    <p className="text-gray-500 dark:text-gray-400">
                      Loading calendar...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <iframe
              src="https://calendly.com/geralddagher/30min"
              className={`
                w-full h-full transition-opacity duration-300
                ${isLoading ? 'opacity-0' : 'opacity-100'}
              `}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
              }}
              title="Schedule meeting with Gerald"
              aria-label="Calendar scheduling interface"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              referrerPolicy="no-referrer-when-downgrade"
              loading="eager"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRequestClose}
              className={`
                fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-colors z-50
                ${isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-100 text-gray-900'}
              `}
              aria-label="Close modal"
            >
              <X size={24} aria-hidden="true" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
export default MeetingInvite;