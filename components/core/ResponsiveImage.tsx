'use client';
import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
interface ResponsiveImageProps extends Omit<ImageProps, 'height' | 'width'> {
  aspectRatio?: string;
  containerClassName?: string;
}
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  aspectRatio = 'aspect-video',
  containerClassName,
  className,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    setError(false);
  }, [src]);
  return (
    <div 
      className={cn(
        'relative w-full overflow-hidden',
        aspectRatio,
        containerClassName
      )}
      style={{ minHeight: '100px' }} 
    >
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={cn(
            'object-cover transition-all duration-300',
            isLoading ? 'scale-110 blur-lg' : 'scale-100 blur-0',
            error ? 'opacity-0' : 'opacity-100',
            className
          )}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => setError(true)}
          {...props}
        />
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <span className="text-gray-500 dark:text-gray-400">Failed to load image</span>
        </div>
      )}
    </div>
  );
};
export default ResponsiveImage;