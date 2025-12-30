import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/core/ThemeProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faLaptop,
  faClock,
  faComments,
  faVideo,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import { RemoveScroll } from 'react-remove-scroll';

interface TMPWhatToExpectProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuestions: () => void;
}
const TMPWhatToExpect: React.FC<TMPWhatToExpectProps> = ({
  isOpen,
  onClose,
  onOpenQuestions
}) => {
  const { isDarkMode } = useTheme();
  const handleQuestionBankClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenQuestions();
  };
  const steps = [
    {
      icon: faLaptop,
      title: 'Scheduling and Descript Invite',
      description:
        "After we schedule your session, you'll receive an invite from Descript. Keep an eye on your inbox because the invite contains the link to the Descript virtual studio we'll use. It's similar to Zoom, but with extra features. You may need to download the app beforehand, so please follow any instructions provided."
    },
    {
      icon: faClock,
      title: 'Session Duration & Preparation',
      description:
        "Each session lasts about an hour, and you'll be on camera, so wear whatever makes you comfortable - a T-shirt or hoodie is fine. The first 15 minutes will cover any questions you have, a quick technical check, and confirm any areas you might not want to discuss."
    },
    {
      icon: faComments,
      title: 'Recording Kickoff',
      description:
        "When we start recording, I'll do a brief welcome, introduce myself, and then introduce you. I'll ask you to share a bit about yourself, and from there, we'll keep things relaxed and conversational."
    },
    {
      icon: faVideo,
      title: 'Conversational Flow & Question Bank',
      description: (
        <>
          We&apos;ll dive deeper into your story and focus on what&apos;s meaningful to you. Feel free to explore any topics in
          detail or skip those you&apos;re not comfortable with. We don&apos;t have a strict list of questions, but we generally
          pull ideas from our{' '}
          <button
            onClick={handleQuestionBankClick}
            className="text-purple-500 hover:text-purple-600 underline focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
            aria-label="Open question bank"
          >
            question bank
          </button>
          .
        </>
      )
    },
    {
      icon: faShare,
      title: 'Post-Recording & Distribution',
      description:
        "After recording, I'll work on editing, then the edited session will be posted to YouTube and my public social media pages (which may include Instagram, LinkedIn, TikTok, Facebook, and more). If you look back and notice a section of the session or a moment that you rather not be posted, please let me know and I'll edit it out."
    }
  ];
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
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
              onClick={onClose}
              role="presentation"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`relative w-full max-w-2xl mx-2 ${
                isDarkMode ? 'bg-gray-900' : 'bg-white'
              } rounded-xl shadow-2xl overflow-hidden`}
              role="dialog"
              aria-labelledby="what-to-expect-title"
              aria-modal="true"
            >
              <div className="max-h-[85vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                    aria-label="Close what to expect dialog"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                  </motion.button>
                                     <h2 id="what-to-expect-title" className="mb-8 pr-8">
                     What to Expect
                   </h2>
                  <div className="space-y-6">
                    {steps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg ${
                          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-full flex-shrink-0 ${
                              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`}
                            aria-hidden="true"
                          >
                            <FontAwesomeIcon icon={step.icon} className="text-purple-500 w-5 h-5" />
                          </div>
                          <div>
                                                         <h3 className="mb-2 text-base font-medium">{step.title}</h3>
                             <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </RemoveScroll>
      )}
    </AnimatePresence>
  );
};
export default TMPWhatToExpect;