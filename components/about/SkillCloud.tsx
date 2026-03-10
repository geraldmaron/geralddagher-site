'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DomainSection, ACCENT_COLORS, DOMAIN_CLUSTERS } from './aboutTypes';

interface SkillCloudProps {
  domainSections: DomainSection[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

const SkillCloud: React.FC<SkillCloudProps> = ({ domainSections }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('reliability');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 overflow-visible" style={{ fontFamily: 'var(--font-display)', lineHeight: '1.3' }}>
          Professional Domains & Expertise
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Capabilities across reliability, platform, product leadership, and risk
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(DOMAIN_CLUSTERS).map(([key, cluster]) => {
          const isActive = selectedFilter === key;
          const color = cluster.color !== 'neutral' ? ACCENT_COLORS[cluster.color as keyof typeof ACCENT_COLORS] : undefined;

          return (
            <button
              key={key}
              onClick={() => setSelectedFilter(key)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2',
                isActive
                  ? color
                    ? cn('text-white dark:text-gray-900', {
                        'bg-blue-600 dark:bg-blue-400': cluster.color === 'blue',
                        'bg-green-600 dark:bg-green-400': cluster.color === 'green',
                        'bg-purple-600 dark:bg-purple-400': cluster.color === 'purple',
                        'bg-amber-600 dark:bg-amber-400': cluster.color === 'amber'
                      })
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {cluster.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <motion.div
          key={selectedFilter}
          className="flex flex-wrap gap-2 max-h-64 md:max-h-80 overflow-y-auto pr-1"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {domainSections
            .filter((section) =>
              selectedFilter === 'all' ? true : section.cluster === selectedFilter
            )
            .flatMap((section) => {
              const color = ACCENT_COLORS[section.color as keyof typeof ACCENT_COLORS];
              return section.skills.map((skill) => (
                <motion.span
                  key={`${section.id}-${skill}`}
                  variants={itemVariants}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm border transition-colors',
                    color.border,
                    color.bg,
                    color.text,
                    'hover:shadow-sm hover:border-current'
                  )}
                >
                  {skill}
                </motion.span>
              ));
            })}
        </motion.div>
      </div>
    </div>
  );
};

export default SkillCloud;
