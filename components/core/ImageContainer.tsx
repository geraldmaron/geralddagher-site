'use client';
import { useRef } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
interface ImageContainerProps extends ImageProps {
  containerClassName?: string;
}
const ImageContainer = ({
  containerClassName,
  className,
  src,
  alt,
  ...props
}: ImageContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden',
        containerClassName,
        props.fill ? 'aspect-square' : ''
      )}
      style={{
        minHeight: props.fill ? '200px' : 'auto',
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'block'
      }}
      data-image-container="true"
      data-image-src={src}
    >
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        {...props}
        sizes={props.fill ? props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : props.sizes}
        className={cn(
          'object-cover',
          className
        )}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          ...props.style
        }}
      />
    </div>
  );
};
export default ImageContainer;