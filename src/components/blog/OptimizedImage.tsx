import { useState } from 'react';
import { cn } from '@/lib/utils';
import { resolveImageUrl } from '@/utils/blogImageMap';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  onLoad,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Подменяем SVG-заглушки на реальные фотографии
  const resolvedSrc = resolveImageUrl(src);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
  };

  const generatedSrcSet = width
    ? `${resolvedSrc} ${Math.max(320, Math.round(width / 2))}w, ${resolvedSrc} ${width}w`
    : undefined;

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-primary/5 animate-pulse" />
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-muted to-primary/10">
          <span className="text-sm text-muted-foreground font-medium">{alt}</span>
        </div>
      ) : (
        <img
          src={resolvedSrc}
          srcSet={generatedSrcSet}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
};
