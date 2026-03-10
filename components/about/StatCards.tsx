'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Award, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCENT_COLORS } from './aboutTypes';
import { StaggerContainer, StaggerItem } from '@/components/core/ScrollReveal';

const stats = [
  {
    icon: Clock,
    value: '8+ Years',
    label: 'Product & Leadership Experience',
    color: ACCENT_COLORS.purple,
    gradient: 'from-slate-500/10 to-slate-600/5 dark:from-slate-500/20 dark:to-slate-600/10',
  },
  {
    icon: DollarSign,
    value: 'Nine-figure+',
    label: 'ARR portfolio impact across enterprise automation',
    color: ACCENT_COLORS.green,
    gradient: 'from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/10',
  },
  {
    icon: Award,
    value: 'Core Domains',
    label: 'Reliability · Platform · AI/ML · Risk',
    color: ACCENT_COLORS.green,
    gradient: 'from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10',
  },
  {
    icon: Heart,
    value: 'Father of 2',
    label: 'Based in South Florida',
    color: ACCENT_COLORS.amber,
    gradient: 'from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10',
  },
];

const StatCards: React.FC = () => {
  return (
    <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StaggerItem key={stat.value}>
          <motion.div
            className={cn(
              'relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 h-full',
              `bg-gradient-to-br ${stat.gradient}`,
              'border-gray-200/50 dark:border-gray-700/40',
              'hover:shadow-lg hover:shadow-primary/5 hover:border-gray-300/60 dark:hover:border-gray-600/60'
            )}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Decorative corner accent */}
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-current opacity-[0.04]" />

            <div className="flex flex-col gap-4">
              <div className={cn(
                'flex items-center justify-center rounded-xl w-11 h-11',
                stat.color.bg
              )}>
                <stat.icon className={cn('w-5 h-5', stat.color.icon)} />
              </div>
              <div>
                <div
                  className="font-bold text-xl text-gray-900 dark:text-white mb-0.5"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {stat.value}
                </div>
                <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            </div>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
};

export default StatCards;
