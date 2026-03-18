import React from 'react';
import { X, Laptop, Clock, MessageCircle, Video, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const handleQuestionBankClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenQuestions();
  };
  const steps = [
    {
      icon: Laptop,
      title: 'Scheduling and Descript Invite',
      description:
        "After we schedule your session, you'll receive an invite from Descript. Keep an eye on your inbox because the invite contains the link to the Descript virtual studio we'll use. It's similar to Zoom, but with extra features. You may need to download the app beforehand, so please follow any instructions provided."
    },
    {
      icon: Clock,
      title: 'Session Duration & Preparation',
      description:
        "Each session lasts about an hour, and you'll be on camera, so wear whatever makes you comfortable - a T-shirt or hoodie is fine. The first 15 minutes will cover any questions you have, a quick technical check, and confirm any areas you might not want to discuss."
    },
    {
      icon: MessageCircle,
      title: 'Recording Kickoff',
      description:
        "When we start recording, I'll do a brief welcome, introduce myself, and then introduce you. I'll ask you to share a bit about yourself, and from there, we'll keep things relaxed and conversational."
    },
    {
      icon: Video,
      title: 'Conversational Flow & Question Bank',
      description: (
        <>
          We&apos;ll dive deeper into your story and focus on what&apos;s meaningful to you. Feel free to explore any topics in
          detail or skip those you&apos;re not comfortable with. We don&apos;t have a strict list of questions, but we generally
          pull ideas from our{' '}
          <button
            onClick={handleQuestionBankClick}
            className="text-primary hover:text-primary/80 underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
            aria-label="Open question bank"
          >
            question bank
          </button>
          .
        </>
      )
    },
    {
      icon: Share2,
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
              className="relative w-full max-w-2xl mx-2 bg-popover rounded-xl shadow-2xl overflow-hidden"
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
                    className="absolute top-4 right-4 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-muted"
                    aria-label="Close what to expect dialog"
                  >
                    <X className="w-5 h-5" />
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
                        className="p-4 rounded-lg bg-muted"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="p-3 rounded-full flex-shrink-0 bg-muted"
                            aria-hidden="true"
                          >
                            <step.icon className="text-primary w-5 h-5" />
                          </div>
                          <div>
                                                         <h3 className="mb-2 text-base font-medium">{step.title}</h3>
                             <p className="text-muted-foreground">{step.description}</p>
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