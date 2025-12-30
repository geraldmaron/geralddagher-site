'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Lightbulb } from 'lucide-react';
import questionsData from '@/lib/tmp_questions.json';
import { useTheme } from '@/components/core/ThemeProvider';
import Button from '@/components/core/Button';
import { RemoveScroll } from 'react-remove-scroll';

interface TMPQuestionsProps {
  isOpen: boolean;
  onClose: () => void;
  scrollPosition: number;
}
const TMPQuestions: React.FC<TMPQuestionsProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  const toggleCategory = (index: number) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };
  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  const handleClose = () => {
    onClose();
  };
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <RemoveScroll>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
              aria-hidden="true"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-labelledby="questions-title"
              className={`relative w-full max-w-4xl mx-2 ${
                isDarkMode ? 'bg-black' : 'bg-white'
              } rounded-2xl shadow-2xl overflow-hidden`}
            >
              <div className="max-h-[85vh] overflow-y-auto overscroll-contain">
                <div className="sticky top-0 z-10 p-4 sm:p-6 pb-4 backdrop-blur-md backdrop-saturate-150 bg-opacity-90">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-4 right-4"
                  >
                    <Button
                      onClick={handleClose}
                      variant="ghost"
                      size="md"
                      className="p-2 rounded-full"
                      aria-label="Close dialog"
                    >
                      <X size={20} />
                    </Button>
                  </motion.div>
                  <h2 
                    id="questions-title"
                    className="text-center mb-4"
                  >
                    Example Questions
                  </h2>
                  <div className="flex items-center justify-center gap-2">
                    <Lightbulb size={16} className="text-yellow-500" />
                    <span className="font-medium text-sm">Conversation Guide</span>
                  </div>
                </div>
                <div className="p-4 sm:p-6 pt-0 space-y-4">
                  {questionsData.categories.map((category, categoryIndex) => (
                    <motion.div
                      key={categoryIndex}
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: categoryIndex * 0.1 }}
                      className={`border-l-2 ${
                        isDarkMode 
                          ? 'border-gray-600/30' 
                          : 'border-gray-300/50'
                      }`}
                    >
                      <Button
                        onClick={() => toggleCategory(categoryIndex)}
                        variant="secondary"
                        size="md"
                        className="w-full px-6 py-3 text-left justify-between"
                        aria-expanded={expandedCategory === categoryIndex}
                      >
                        <h3 className="text-sm font-medium">
                          {category.title}
                        </h3>
                        <motion.div
                          animate={{ rotate: expandedCategory === categoryIndex ? 180 : 0 }}
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </Button>
                      <AnimatePresence>
                        {expandedCategory === categoryIndex && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 space-y-2">
                              {category.questions.map((question, questionIndex) => (
                                <motion.div
                                  key={questionIndex}
                                  initial={false}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: questionIndex * 0.1 }}
                                  className={`border-l-2 ${
                                    isDarkMode 
                                      ? 'border-gray-600/40' 
                                      : 'border-gray-300/60'
                                  }`}
                                >
                                  <Button
                                    onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                                    variant="ghost"
                                    size="md"
                                    className="w-full p-3 text-left flex justify-between items-center gap-4"
                                    aria-expanded={expandedQuestions[`${categoryIndex}-${questionIndex}`]}
                                  >
                                    <p className="flex-1 text-sm">{question.question}</p>
                                    <ChevronDown 
                                      size={14}
                                      className={`transform transition-transform ${
                                        expandedQuestions[`${categoryIndex}-${questionIndex}`] ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </Button>
                                  <AnimatePresence>
                                    {expandedQuestions[`${categoryIndex}-${questionIndex}`] && (
                                      <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <p className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm">
                                          {question.description}
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </RemoveScroll>
      )}
    </AnimatePresence>
  );
};
export default TMPQuestions;