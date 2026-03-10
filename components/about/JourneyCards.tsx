'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Heart, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCENT_COLORS } from './aboutTypes';

interface JourneyCardsProps {
  onOpenProfessional: () => void;
  onOpenPersonal: () => void;
  personalInfo: any;
}

const JourneyCards: React.FC<JourneyCardsProps> = ({ onOpenProfessional, onOpenPersonal, personalInfo }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
      <motion.button
        onClick={onOpenProfessional}
        className={cn(
          "group relative rounded-2xl p-6 border transition-all duration-300 text-left overflow-hidden",
          "bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 dark:from-blue-950/40 dark:via-gray-900 dark:to-indigo-950/30",
          "border-blue-200/40 dark:border-blue-800/40",
          "hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300/60 dark:hover:border-blue-700/50",
          "flex flex-col h-full"
        )}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', ACCENT_COLORS.blue.bg)}>
              <Briefcase className={cn('w-5 h-5', ACCENT_COLORS.blue.icon)} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Professional Journey</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">From burgers to cloud platforms</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[120px]">
            <div className="flex flex-wrap gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700">
              {[
                { label: 'Reliability & DR', color: ACCENT_COLORS.blue },
                { label: 'Platform Delivery', color: ACCENT_COLORS.green },
                { label: 'Risk & Compliance', color: ACCENT_COLORS.amber },
                { label: 'Product Leadership', color: ACCENT_COLORS.purple }
              ].map((item) => (
                <span
                  key={item.label}
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
                    item.color.border,
                    item.color.bg,
                    item.color.text
                  )}
                >
                  {item.label}
                </span>
              ))}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mt-4">
              {personalInfo?.roles?.[0]?.abbreviatedSummary}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', ACCENT_COLORS.blue.border, ACCENT_COLORS.blue.text, ACCENT_COLORS.blue.bg)}>
              <Award className="w-3 h-3" />
              <span>Core Domains & Skills</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white group-hover:gap-2 transition-all">
              <span>View journey</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.button>

      <motion.button
        onClick={onOpenPersonal}
        className={cn(
          "group relative rounded-2xl p-6 border transition-all duration-300 text-left overflow-hidden",
          "bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 dark:from-amber-950/40 dark:via-gray-900 dark:to-orange-950/30",
          "border-amber-200/40 dark:border-amber-800/40",
          "hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-300/60 dark:hover:border-amber-700/50",
          "flex flex-col h-full"
        )}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', ACCENT_COLORS.amber.bg)}>
              <Heart className={cn('w-5 h-5', ACCENT_COLORS.amber.icon)} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Personal Story</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">From the Bronx to South Florida</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-[120px]">
            <div className="grid grid-cols-2 gap-2">
              <div className="px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Family</div>
                <div className="text-xs text-gray-900 dark:text-white mt-0.5">Married, 2 boys</div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Hometown</div>
                <div className="text-xs text-gray-900 dark:text-white mt-0.5">Bronx, NY</div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Location</div>
                <div className="text-xs text-gray-900 dark:text-white mt-0.5">{personalInfo?.profile?.location}</div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-500">Pets</div>
                <div className="text-xs text-gray-900 dark:text-white mt-0.5">{personalInfo?.profile?.pets}</div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mt-4">
              {personalInfo?.profile?.about?.personal?.[0]?.substring(0, 120) || personalInfo?.profile?.about?.businessCard?.substring(0, 120) || 'Learn more about my personal journey'}...
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', ACCENT_COLORS.amber.border, ACCENT_COLORS.amber.text, ACCENT_COLORS.amber.bg)}>
              <Heart className="w-3 h-3" />
              <span>Family First</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white group-hover:gap-2 transition-all">
              <span>Read story</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  );
};

export default JourneyCards;
