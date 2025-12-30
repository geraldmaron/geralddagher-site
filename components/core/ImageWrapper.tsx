'use client';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
interface ImageWrapperProps extends Omit<ImageProps, 'fill'> {
  containerClassName?: string;
  imageClassName?: string;
  aspectRatio?: string;
  alt: string;
}
const ImageWrapper: React.FC<ImageWrapperProps> = ({
  containerClassName,
  imageClassName,
  aspectRatio = 'aspect-auto',
  alt = '',
  ...props
}) => {
  return (
    <div className={cn(
      'relative w-full',
      aspectRatio,
      containerClassName
    )}>
      <div className="relative w-full h-full">
        <Image
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={cn(
            'object-cover',
            imageClassName
          )}
          alt={alt}
          {...props}
        />
      </div>
    </div>
  );
};
export default ImageWrapper;