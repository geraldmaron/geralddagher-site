'use client';
import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes, faExclamationCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/core/ThemeProvider';
export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  source?: string;
  technical?: boolean;
  resolved?: boolean;
}
export interface ErrorsProps {
  errors: ErrorMessage[];
  onDismiss: (id: string) => void;
}
const Errors: React.FC<ErrorsProps> = ({ errors, onDismiss }) => {
  const { isDarkMode } = useTheme();
  if (!errors.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {errors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={cn(
              'mb-4 p-4 rounded-lg shadow-lg',
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900',
              error.type === 'error' ? 'border-l-4 border-red-500' :
              error.type === 'warning' ? 'border-l-4 border-yellow-500' :
              'border-l-4 border-blue-500'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={
                    error.type === 'error' ? faExclamationCircle :
                    error.type === 'warning' ? faExclamationTriangle :
                    faInfoCircle
                  }
                  className={cn(
                    'mr-3',
                    error.type === 'error' ? 'text-red-500' :
                    error.type === 'warning' ? 'text-yellow-500' :
                    'text-blue-500'
                  )}
                />
                <span>{error.message}</span>
              </div>
              <button
                onClick={() => onDismiss(error.id)}
                className={cn(
                  'ml-4 p-1 rounded-full',
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                )}
              >
                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
export default Errors;