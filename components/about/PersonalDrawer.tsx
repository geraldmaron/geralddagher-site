'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, MapPin, User, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Sheet from '@radix-ui/react-dialog';
import Button from '@/components/core/Button';
import { ACCENT_COLORS } from './aboutTypes';

interface PersonalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  personalInfo: any;
}

const PersonalDrawer: React.FC<PersonalDrawerProps> = ({ isOpen, onClose, personalInfo }) => {
  return (
    <Sheet.Root open={isOpen} onOpenChange={onClose}>
      <Sheet.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <Sheet.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Sheet.Overlay>

              <Sheet.Content asChild>
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed right-0 top-0 z-50 h-screen w-full sm:max-w-2xl bg-white dark:bg-neutral-950 border-l border-gray-200 dark:border-neutral-800 shadow-2xl focus:outline-none flex flex-col"
                >
                  <Sheet.Title className="sr-only">Personal Story</Sheet.Title>
                  <Sheet.Description className="sr-only">
                    Detailed information about personal story, values, and background
                  </Sheet.Description>

                  <div className="flex-shrink-0 px-6 py-6 border-b border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 dark:border-neutral-800', ACCENT_COLORS.amber.bg)}>
                          <Heart className={cn('w-6 h-6', ACCENT_COLORS.amber.icon)} />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Personal Story
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            The person behind the professional
                          </p>
                        </div>
                      </div>
                      <Sheet.Close asChild>
                        <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
                          <X className="w-5 h-5" />
                        </Button>
                      </Sheet.Close>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-8">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">At a Glance</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Location', value: personalInfo?.profile?.location, icon: MapPin },
                            { label: 'Family', value: 'Married, 2 boys', icon: User },
                            { label: 'Hometown', value: personalInfo?.profile?.hometown, icon: Home },
                            { label: 'Pets', value: personalInfo?.profile?.pets, icon: Heart }
                          ].map((item) => (
                            <div
                              key={item.label}
                              className={cn(
                                'rounded-xl p-4 border transition-all',
                                'bg-white/60 dark:bg-gray-800/60',
                                'border-gray-200/50 dark:border-gray-700/50'
                              )}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <item.icon className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                                  {item.label}
                                </span>
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white font-medium">
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                          Roots & Values
                        </h3>
                        <div className={cn(
                          'rounded-xl p-4 border',
                          'bg-amber-500/5 dark:bg-amber-500/10',
                          'border-amber-500/20 dark:border-amber-500/30'
                        )}>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            Born and raised in the Bronx as a child of Caribbean immigrants. My heritage taught me
                            the value of hard work, community, and never forgetting where you came from. These roots
                            ground everything I do, from how I lead teams to how I raise my children.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">My Journey</h3>
                        <div className="space-y-4">
                          {personalInfo?.profile?.about?.personal && personalInfo.profile.about.personal.length > 0 ? (
                            personalInfo.profile.about.personal.map((paragraph: string, index: number) => (
                              <p key={index} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {paragraph}
                              </p>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {personalInfo?.profile?.about?.businessCard || 'My personal journey and story'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                          Passions & Interests
                        </h3>
                        <div className="space-y-3">
                          <div className={cn(
                            'rounded-xl p-4 border',
                            'bg-white/60 dark:bg-gray-800/60',
                            'border-gray-200/50 dark:border-gray-700/50'
                          )}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🎤</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">Spoken Word Poetry</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Writing and performing since high school. A craft that influences everything I create
                            </p>
                          </div>
                          <div className={cn(
                            'rounded-xl p-4 border',
                            'bg-white/60 dark:bg-gray-800/60',
                            'border-gray-200/50 dark:border-gray-700/50'
                          )}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🏀⚾🏈</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">NYC Sports</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Knicks, Yankees, and Giants. Die-hard fan representing NYC wherever I go
                            </p>
                          </div>
                          <div className={cn(
                            'rounded-xl p-4 border',
                            'bg-white/60 dark:bg-gray-800/60',
                            'border-gray-200/50 dark:border-gray-700/50'
                          )}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">✊</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                Advocacy & <span className="inline-flex">
                                  <span className="animate-pulse text-red-500 dark:text-red-400">A</span>
                                  <span className="animate-pulse text-orange-500 dark:text-orange-400" style={{ animationDelay: '0.1s' }}>l</span>
                                  <span className="animate-pulse text-green-500 dark:text-green-400" style={{ animationDelay: '0.2s' }}>l</span>
                                  <span className="animate-pulse text-blue-500 dark:text-blue-400" style={{ animationDelay: '0.3s' }}>y</span>
                                </span>ship
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Using my platform to amplify voices and create opportunities for underrepresented communities
                            </p>
                          </div>
                          <div className={cn(
                            'rounded-xl p-4 border',
                            'bg-white/60 dark:bg-gray-800/60',
                            'border-gray-200/50 dark:border-gray-700/50'
                          )}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🧠</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">Mental Health & Neurodiversity</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Living as AuDHD and raising two boys, one on the spectrum. Building understanding, breaking stigmas, and learning daily lessons about attention, presence, and what it means to truly see and be seen
                            </p>
                          </div>
                          <div className={cn(
                            'rounded-xl p-4 border',
                            'bg-white/60 dark:bg-gray-800/60',
                            'border-gray-200/50 dark:border-gray-700/50'
                          )}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🌍</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">Culture & Community</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Understanding how culture shapes belonging, exclusion, and collective identity. From organizational systems to social movements, culture drives what communities become
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Sheet.Content>
            </>
          )}
        </AnimatePresence>
      </Sheet.Portal>
    </Sheet.Root>
  );
};

export default PersonalDrawer;
