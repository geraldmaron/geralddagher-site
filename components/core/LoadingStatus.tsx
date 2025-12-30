'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/core/Card';
import { cn } from '@/lib/utils';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Clock, 
  Brain, 
  RefreshCw, 
  Trash2,
  Upload,
  Download,
  Zap,
  Sparkles,
  X
} from 'lucide-react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type LoadingVariant = 
  | 'spinner' 
  | 'heart' 
  | 'progress-bar' 
  | 'dots' 
  | 'pulse' 
  | 'skeleton'
  | 'minimal'
  | 'operation'
  | 'banner';

export type LoadingStatusType = 'loading' | 'success' | 'error' | 'info' | 'warning';

export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type LoadingTheme = 'default' | 'gradient' | 'glass' | 'minimal' | 'card' | 'prominent' | 'floating';

interface ProgressData {
  current: number;
  total: number;
  percentage?: number;
  label?: string;
  showPercentage?: boolean;
  showFraction?: boolean;
  steps?: string[];
  currentStep?: number;
}

interface LoadingStatusProps {
  // Core props
  loading?: boolean;
  status?: LoadingStatusType;
  variant?: LoadingVariant;
  size?: LoadingSize;
  theme?: LoadingTheme;
  
  // Content
  title?: string;
  message?: string;
  detailedMessage?: string;
  subMessage?: string;
  operationType?: 'relearn' | 'clear' | 'upload' | 'download' | 'process' | 'analyze';
  
  // Progress
  progress?: ProgressData;
  
  // Styling
  className?: string;
  showAsCard?: boolean;
  fullWidth?: boolean;
  centered?: boolean;
  sticky?: boolean;
  
  // Animation
  iconAnimation?: 'spin' | 'pulse' | 'bounce' | 'heartbeat' | 'none';
  animationDuration?: number;
  
  // Behavior
  minDuration?: number;
  autoHide?: boolean;
  showIcon?: boolean;
  showProgress?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  
  // Accessibility
  ariaLabel?: string;
  role?: string;
}

// ============================================================================
// CONSTANTS AND CONFIGURATIONS
// ============================================================================

const statusIcons = {
  loading: Loader2,
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle
};

const operationIcons = {
  relearn: Brain,
  clear: Trash2,
  upload: Upload,
  download: Download,
  process: Zap,
  analyze: Sparkles
};

const statusColors = {
  loading: {
    primary: 'bg-blue-500',
    secondary: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  success: {
    primary: 'bg-green-500',
    secondary: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800'
  },
  error: {
    primary: 'bg-red-500',
    secondary: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
  },
  info: {
    primary: 'bg-blue-500',
    secondary: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  warning: {
    primary: 'bg-yellow-500',
    secondary: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800'
  }
};

const sizeConfig = {
  xs: {
    icon: 'w-3 h-3',
    text: 'text-xs',
    padding: 'p-2',
    spacing: 'gap-1'
  },
  sm: {
    icon: 'w-4 h-4',
    text: 'text-sm',
    padding: 'p-3',
    spacing: 'gap-2'
  },
  md: {
    icon: 'w-5 h-5',
    text: 'text-base',
    padding: 'p-4',
    spacing: 'gap-3'
  },
  lg: {
    icon: 'w-6 h-6',
    text: 'text-lg',
    padding: 'p-6',
    spacing: 'gap-4'
  },
  xl: {
    icon: 'w-8 h-8',
    text: 'text-xl',
    padding: 'p-8',
    spacing: 'gap-6'
  }
};

const animationClasses = {
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  heartbeat: 'animate-pulse',
  none: ''
};

const humanMessages = {
  relearn: {
    loading: 'Refreshing your AI knowledge...',
    success: 'Your AI has learned something new!',
    error: 'Learning refresh failed',
    info: 'Preparing to refresh learnings',
    warning: 'Learning refresh had issues'
  },
  clear: {
    loading: 'Clearing your data...',
    success: 'Data cleared successfully',
    error: 'Failed to clear data',
    info: 'Preparing to clear data',
    warning: 'Some data could not be cleared'
  },
  upload: {
    loading: 'Uploading your content...',
    success: 'Upload completed successfully',
    error: 'Upload failed',
    info: 'Preparing upload',
    warning: 'Upload completed with warnings'
  },
  download: {
    loading: 'Downloading your data...',
    success: 'Download completed',
    error: 'Download failed',
    info: 'Preparing download',
    warning: 'Download completed with issues'
  },
  process: {
    loading: 'Processing your request...',
    success: 'Processing completed',
    error: 'Processing failed',
    info: 'Preparing to process',
    warning: 'Processing completed with warnings'
  },
  analyze: {
    loading: 'Analyzing your content...',
    success: 'Analysis completed',
    error: 'Analysis failed',
    info: 'Preparing analysis',
    warning: 'Analysis completed with issues'
  }
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const heartVariants = {
  initial: {
    scale: 0.8,
    opacity: 0.5,
  },
  animate: {
    scale: [0.8, 1.2, 0.8],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1,
      ease: 'easeInOut' as const,
      repeat: Infinity,
    },
  },
};

const dotsVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 0.6,
      ease: 'easeInOut' as const,
      repeat: Infinity,
    },
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 1.5,
      ease: 'easeInOut' as const,
      repeat: Infinity,
    },
  },
};

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

// Heart Loading Component (from LoadingSpinner)
const HeartLoader: React.FC<{ size: LoadingSize; className?: string }> = ({ size, className }) => {
  const sizeClass = sizeConfig[size].icon;
  
  return (
    <motion.div
      className={cn('relative', className)}
      variants={heartVariants}
      initial="initial"
      animate="animate"
    >
      <div className={cn('absolute bg-red-500 transform rotate-45', sizeClass)} 
           style={{ 
             left: size === 'xs' ? '8px' : size === 'sm' ? '12px' : size === 'md' ? '16px' : size === 'lg' ? '20px' : '24px',
             bottom: size === 'xs' ? '6px' : size === 'sm' ? '8px' : size === 'md' ? '10px' : size === 'lg' ? '12px' : '16px'
           }} />
      <div className={cn('absolute bg-red-500 rounded-full', sizeClass)} 
           style={{ 
             left: size === 'xs' ? '2px' : size === 'sm' ? '4px' : size === 'md' ? '6px' : size === 'lg' ? '8px' : '12px',
             top: size === 'xs' ? '2px' : size === 'sm' ? '4px' : size === 'md' ? '6px' : size === 'lg' ? '8px' : '12px'
           }} />
      <div className={cn('absolute bg-red-500 rounded-full', sizeClass)} 
           style={{ 
             right: size === 'xs' ? '2px' : size === 'sm' ? '4px' : size === 'md' ? '6px' : size === 'lg' ? '8px' : '12px',
             top: size === 'xs' ? '2px' : size === 'sm' ? '4px' : size === 'md' ? '6px' : size === 'lg' ? '8px' : '12px'
           }} />
    </motion.div>
  );
};

// Dots Loading Component
const DotsLoader: React.FC<{ size: LoadingSize; className?: string }> = ({ size, className }) => {
  const dotSize = sizeConfig[size].icon;
  
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn('bg-current rounded-full', dotSize)}
          variants={dotsVariants}
          animate="animate"
          transition={{
            delay: index * 0.2,
            duration: 0.6,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
};

// Skeleton Loading Component
const SkeletonLoader: React.FC<{ size: LoadingSize; className?: string }> = ({ size, className }) => {
  const config = sizeConfig[size];
  
  return (
    <div className={cn('animate-pulse', className)}>
      <div className={cn('bg-gray-200 dark:bg-gray-700 rounded', config.icon)} />
      <div className={cn('bg-gray-200 dark:bg-gray-700 rounded mt-2', 'h-3 w-24')} />
      <div className={cn('bg-gray-200 dark:bg-gray-700 rounded mt-1', 'h-2 w-16')} />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LoadingStatus({
  // Core props
  loading = false,
  status = 'loading',
  variant = 'spinner',
  size = 'md',
  theme = 'default',
  
  // Content
  title,
  message,
  detailedMessage,
  subMessage,
  operationType,
  
  // Progress
  progress,
  
  // Styling
  className,
  showAsCard = true,
  fullWidth = false,
  centered = false,
  sticky = false,
  
  // Animation
  iconAnimation = 'spin',
  animationDuration = 1000,
  
  // Behavior
  minDuration = 0,
  autoHide = false,
  showIcon = true,
  showProgress = true,
  dismissible = false,
  onDismiss,
  
  // Accessibility
  ariaLabel,
  role = 'status'
}: LoadingStatusProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [internalLoading, setInternalLoading] = useState(loading);
  
  useEffect(() => {
    if (minDuration > 0 && loading) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, minDuration);
      return () => clearTimeout(timer);
    }
  }, [minDuration, loading]);
  
  useEffect(() => {
    if (autoHide && !loading && status !== 'loading') {
      const timer = setTimeout(() => {
        setInternalLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoHide, loading, status]);
  
  const config = sizeConfig[size];
  const colors = statusColors[status];
  const StatusIcon = statusIcons[status];
  const animationClass = animationClasses[iconAnimation];
  
  // Calculate progress percentage
  const progressPercentage = progress?.percentage || 
    (progress ? (progress.current / progress.total) * 100 : 0);
  
  // Render different variants
  const renderLoader = () => {
    switch (variant) {
      case 'heart':
        return <HeartLoader size={size} className={colors.text} />;
      
      case 'dots':
        return <DotsLoader size={size} className={colors.text} />;
      
      case 'skeleton':
        return <SkeletonLoader size={size} className={className} />;
      
      case 'pulse':
        return (
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className={cn('rounded-full', colors.primary, config.icon)}
          />
        );
      
      case 'progress-bar':
        return (
          <div className="w-full max-w-xs">
            <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2')}>
              <motion.div
                className={cn('h-2 rounded-full', colors.primary)}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            {progress && showProgress && (
              <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{progress.label || 'Progress'}</span>
                <span>
                  {progress.showPercentage ? `${Math.round(progressPercentage)}%` : ''}
                  {progress.showFraction ? ` (${progress.current}/${progress.total})` : ''}
                </span>
              </div>
            )}
          </div>
        );
      
      case 'minimal':
        return (
          <div className={cn('flex items-center', config.spacing)}>
            {showIcon && (
              <StatusIcon className={cn(config.icon, colors.text, status === 'loading' && animationClass)} />
            )}
            <span className={cn(config.text, 'text-gray-600 dark:text-gray-400')}>
              {message || title || 'Processing...'}
            </span>
          </div>
        );
      
      case 'operation': {
        const OperationIcon = operationType ? operationIcons[operationType] : StatusIcon;
        const operationMessage = operationType && humanMessages[operationType] 
          ? humanMessages[operationType][status] 
          : message || title || 'Processing...';
        
        return (
          <div className={cn('flex items-center', config.spacing)}>
            <div className={cn('p-3 rounded-xl', colors.secondary)}>
              <OperationIcon className={cn(config.icon, colors.text, status === 'loading' && animationClass)} />
            </div>
            <div className="flex-1">
              <div className={cn('font-semibold text-gray-900 dark:text-white', config.text)}>
                {operationMessage}
              </div>
              {progress && progress.steps && (
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Step {progress.currentStep || progress.current} of {progress.steps.length}: {progress.steps[progress.currentStep || progress.current - 1]}
                </div>
              )}
            </div>
          </div>
        );
      }
      
      case 'banner': {
        const BannerIcon = operationType ? operationIcons[operationType] : StatusIcon;
        const bannerMessage = operationType && humanMessages[operationType] 
          ? humanMessages[operationType][status] 
          : message || title || 'Processing...';
        
        return (
          <div className={cn('flex items-center justify-between w-full', config.spacing)}>
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', colors.primary)}>
                <BannerIcon className={cn('w-5 h-5 text-white', status === 'loading' && animationClass)} />
              </div>
              <div>
                <div className={cn('font-semibold text-gray-900 dark:text-white', config.text)}>
                  {bannerMessage}
                </div>
                {detailedMessage && (
                  <div className={cn('text-sm text-gray-600 dark:text-gray-400 mt-1')}>
                    {detailedMessage}
                  </div>
                )}
              </div>
            </div>
            {dismissible && onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      }
      
      case 'spinner':
      default:
        return (
          <StatusIcon className={cn(config.icon, colors.text, status === 'loading' && animationClass)} />
        );
    }
  };
  
  // Don't render if not visible or not loading
  if (!isVisible || (!internalLoading && !message && !title)) {
    return null;
  }
  
  // Minimal variant - no card wrapper
  if (variant === 'minimal' || !showAsCard) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'flex items-center',
            config.spacing,
            centered && 'justify-center',
            fullWidth && 'w-full',
            className
          )}
          role={role}
          aria-label={ariaLabel || message || title}
        >
          {renderLoader()}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Banner variant - special handling for prominent display
  if (variant === 'banner') {
    const getThemeClasses = () => {
      switch (theme) {
        case 'gradient':
          return `bg-gradient-to-r ${colors.secondary} ${colors.border}`;
        case 'glass':
          return `bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${colors.border}`;
        case 'minimal':
          return `bg-transparent`;
        case 'card':
          return `bg-white dark:bg-gray-800 ${colors.border}`;
        case 'prominent':
          return `bg-gradient-to-r ${colors.secondary} ${colors.border} shadow-lg`;
        case 'floating':
          return `bg-white/95 dark:bg-gray-900/95 backdrop-blur-md ${colors.border} shadow-xl border-2`;
        default:
          return `bg-white dark:bg-gray-800 ${colors.border}`;
      }
    };

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'w-full',
            sticky && 'sticky top-4 z-50',
            className
          )}
          role={role}
          aria-label={ariaLabel || message || title}
        >
          <div className={cn(
            'rounded-xl border p-4',
            getThemeClasses(),
            'shadow-lg'
          )}>
            {renderLoader()}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
  
  // Card-based variants
  const getThemeClasses = () => {
    switch (theme) {
      case 'gradient':
        return `bg-gradient-to-r ${colors.secondary} ${colors.border}`;
      case 'glass':
        return `bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${colors.border}`;
      case 'minimal':
        return `bg-transparent`;
      case 'card':
        return `bg-white dark:bg-gray-800 ${colors.border}`;
      case 'prominent':
        return `bg-gradient-to-r ${colors.secondary} ${colors.border} shadow-lg`;
      case 'floating':
        return `bg-white/95 dark:bg-gray-900/95 backdrop-blur-md ${colors.border} shadow-xl border-2`;
      default:
        return `bg-white dark:bg-gray-800 ${colors.border}`;
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={cn('w-full', className)}
        role={role}
        aria-label={ariaLabel || message || title}
      >
        <Card className={cn(
          config.padding,
          getThemeClasses(),
          'border'
        )}>
          <div className={cn('flex items-center', config.spacing)}>
            {/* Icon/Loader */}
            <div className="flex-shrink-0">
              {variant === 'progress-bar' ? (
                <div className={cn('p-2 rounded-lg', colors.primary)}>
                  <StatusIcon className={cn('w-4 h-4 text-white', status === 'loading' && animationClass)} />
                </div>
              ) : (
                renderLoader()
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title/Message */}
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('font-medium text-gray-900 dark:text-white', config.text)}>
                  {title || message || 'Processing...'}
                </span>
                {progress && variant !== 'progress-bar' && (
                  <span className={cn('text-gray-500 dark:text-gray-400', config.text)}>
                    ({progress.current}/{progress.total})
                  </span>
                )}
              </div>
              
              {/* Detailed Message */}
              {detailedMessage && (
                <p className={cn('text-gray-600 dark:text-gray-400', config.text)}>
                  {detailedMessage}
                </p>
              )}
              
              {/* Sub Message */}
              {subMessage && (
                <p className={cn('text-gray-500 dark:text-gray-400', config.text)}>
                  {subMessage}
                </p>
              )}
              
              {/* Progress Bar (for non-progress-bar variants) */}
              {progress && variant !== 'progress-bar' && showProgress && (
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={cn('h-2 rounded-full', colors.primary)}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

// Quick loading components for common use cases
export const LoadingSpinner = (props: Omit<LoadingStatusProps, 'variant'>) => (
  <LoadingStatus {...props} variant="spinner" />
);

export const LoadingHeart = (props: Omit<LoadingStatusProps, 'variant'>) => (
  <LoadingStatus {...props} variant="heart" />
);

export const LoadingProgress = (props: Omit<LoadingStatusProps, 'variant'>) => (
  <LoadingStatus {...props} variant="progress-bar" />
);

export const LoadingDots = (props: Omit<LoadingStatusProps, 'variant'>) => (
  <LoadingStatus {...props} variant="dots" />
);

export const LoadingMinimal = (props: Omit<LoadingStatusProps, 'variant'>) => (
  <LoadingStatus {...props} variant="minimal" showAsCard={false} />
);

export const LoadingOperation = (props: Omit<LoadingStatusProps, 'variant'>) => (
  <LoadingStatus {...props} variant="operation" theme="prominent" />
);

export const LoadingBanner = (props: Omit<LoadingStatusProps, 'variant'>) => (
  <LoadingStatus {...props} variant="banner" theme="floating" sticky />
);

export default LoadingStatus;