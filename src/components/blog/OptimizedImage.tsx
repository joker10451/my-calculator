import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean; // Для критических изображений (above the fold)
  sizes?: string; // Для responsive images
  onLoad?: () => void;
}

/**
 * Оптимизированный компонент изображения
 * - Поддержка WebP с fallback
 * - Responsive images (srcset)
 * - Blur-up placeholder
 * - Lazy loading для изображений ниже fold
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Если priority, сразу загружаем
  const imgRef = useRef<HTMLImageElement>(null);

  // Генерация WebP версии URL
  const getWebPUrl = (url: string): string => {
    if (url.endsWith('.webp')) return url;
    const extension = url.split('.').pop();
    return url.replace(`.${extension}`, '.webp');
  };

  // Генерация srcset для responsive images
  const generateSrcSet = (url: string): string => {
    const webpUrl = getWebPUrl(url);
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    
    return sizes
      .map(size => {
        // Предполагаем, что у нас есть разные размеры изображений
        const sizedUrl = webpUrl.replace(/\.(webp|jpg|jpeg|png)$/, `-${size}w.$1`);
        return `${sizedUrl} ${size}w`;
      })
      .join(', ');
  };

  // Генерация blur placeholder (base64 SVG)
  const getBlurPlaceholder = (): string => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width || 400} ${height || 300}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0' filter='url(%23b)'/%3E%3C/svg%3E`;
  };

  // Intersection Observer для lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Начинаем загрузку за 50px до видимости
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const webpUrl = getWebPUrl(src);
  const srcSet = generateSrcSet(src);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <img
          src={getBlurPlaceholder()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
      )}

      {/* Основное изображение */}
      <picture>
        {/* WebP версия с srcset */}
        {isInView && (
          <source
            type="image/webp"
            srcSet={srcSet}
            sizes={sizes}
          />
        )}
        
        {/* Fallback для браузеров без поддержки WebP */}
        <img
          ref={imgRef}
          src={isInView ? src : getBlurPlaceholder()}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      </picture>
    </div>
  );
};
